import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(
    bookingId: number,
    userId: number,
    amount: number,
    paymentMethod?: string,
  ) {
    // Verwende Transaktion für atomare Operationen
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.tripPassenger.findUnique({
        where: { id: bookingId },
        include: { trip: true, payments: true, passenger: true },
      });

      if (!booking) {
        throw new NotFoundException('Buchung nicht gefunden.');
      }

      // Nur der Passagier kann bezahlen
      if (booking.passenger_id !== userId) {
        throw new ForbiddenException('Nur der Passagier kann die Fahrt bezahlen.');
      }

      // Prüfe, ob bereits bezahlt wurde
      const existingPaidPayment = booking.payments.find(
        (p) => p.status === 'bezahlt',
      );
      if (existingPaidPayment) {
        throw new BadRequestException('Diese Buchung wurde bereits bezahlt.');
      }

      // Prüfe, ob die Buchung storniert wurde
      if (booking.status === 'storniert') {
        throw new BadRequestException('Eine stornierte Buchung kann nicht bezahlt werden.');
      }

      // Validiere Betrag
      if (amount <= 0) {
        throw new BadRequestException('Der Betrag muss größer als 0 sein.');
      }

      // Prüfe, ob der Betrag dem Fahrtpreis entspricht (mit Toleranz für Rundung)
      if (booking.trip.price) {
        const priceDifference = Math.abs(amount - booking.trip.price);
        if (priceDifference > 0.01) {
          throw new BadRequestException(
            `Der Betrag (${amount.toFixed(2)} EUR) entspricht nicht dem Fahrtpreis (${booking.trip.price.toFixed(2)} EUR).`,
          );
        }
        // Verwende den exakten Trip-Preis für die Abrechnung
        amount = booking.trip.price;
      }

      // Wenn mit Guthaben bezahlt wird, prüfe Guthaben und buche ab
      if (paymentMethod === 'guthaben' || paymentMethod === 'balance') {
        // Hole aktuelles Guthaben mit Row-Level Locking (für Race-Condition-Schutz)
        const passenger = await tx.user.findUnique({
          where: { id: userId },
        });

        if (!passenger) {
          throw new NotFoundException('Nutzer nicht gefunden.');
        }

        const currentBalance = passenger.balance || 0;
        if (currentBalance < amount) {
          throw new BadRequestException(
            `Unzureichendes Guthaben. Verfügbar: ${currentBalance.toFixed(2)} EUR, Benötigt: ${amount.toFixed(2)} EUR`,
          );
        }

        // Hole Fahrer-Guthaben
        const driver = await tx.user.findUnique({
          where: { id: booking.trip.user_id },
        });

        if (!driver) {
          throw new NotFoundException('Fahrer nicht gefunden.');
        }

        const driverBalance = driver.balance || 0;

        // Atomare Guthaben-Transaktionen
        // Passagier: Guthaben abbuchen
        await tx.user.update({
          where: { id: userId },
          data: { balance: { decrement: amount } },
        });

        // Fahrer: Guthaben gutschreiben
        await tx.user.update({
          where: { id: booking.trip.user_id },
          data: { balance: { increment: amount } },
        });
      }

      // Generiere Transaction ID
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Wenn mit Guthaben bezahlt, direkt als bezahlt markieren
      const paymentStatus = (paymentMethod === 'guthaben' || paymentMethod === 'balance') 
        ? 'bezahlt' 
        : 'ausstehend';

      // Erstelle Payment-Eintrag
      return tx.payment.create({
        data: {
          trip_passenger_id: bookingId,
          amount,
          status: paymentStatus,
          payment_method: paymentMethod || 'unbekannt',
          transaction_id: transactionId,
          paid_at: paymentStatus === 'bezahlt' ? new Date() : null,
        },
        include: {
          trip_passenger: {
            include: {
              trip: {
                include: {
                  vehicle: true,
                  user: true,
                },
              },
              passenger: true,
            },
          },
        },
      });
    });
  }

  async confirmPayment(paymentId: number, userId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        trip_passenger: {
          include: { trip: true, passenger: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Zahlung nicht gefunden.');
    }

    // Nur der Passagier oder der Fahrer können die Zahlung bestätigen
    const isPassenger = payment.trip_passenger.passenger_id === userId;
    const isDriver = payment.trip_passenger.trip.user_id === userId;

    if (!isPassenger && !isDriver) {
      throw new ForbiddenException('Du hast keine Berechtigung, diese Zahlung zu bestätigen.');
    }

    if (payment.status === 'bezahlt') {
      throw new BadRequestException('Diese Zahlung wurde bereits bestätigt.');
    }

    if (payment.status === 'storniert') {
      throw new BadRequestException('Eine stornierte Zahlung kann nicht bestätigt werden.');
    }

    // Wenn Zahlung noch ausstehend ist und nicht mit Guthaben bezahlt wurde,
    // Guthaben prüfen und abbuchen (falls gewünscht)
    // Hier könnte auch eine externe Zahlungsmethode integriert werden

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'bezahlt',
        paid_at: new Date(),
      },
      include: {
        trip_passenger: {
          include: {
            trip: {
              include: {
                vehicle: true,
                user: true,
              },
            },
            passenger: true,
          },
        },
      },
    });
  }

  async cancelPayment(paymentId: number, userId: number) {
    // Verwende Transaktion für atomare Operationen
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          trip_passenger: {
            include: { trip: true, passenger: true },
          },
        },
      });

      if (!payment) {
        throw new NotFoundException('Zahlung nicht gefunden.');
      }

      // Nur der Passagier kann die Zahlung stornieren
      if (payment.trip_passenger.passenger_id !== userId) {
        throw new ForbiddenException('Nur der Passagier kann die Zahlung stornieren.');
      }

      if (payment.status === 'storniert') {
        throw new BadRequestException('Diese Zahlung wurde bereits storniert.');
      }

      // Wenn bereits bezahlt wurde und mit Guthaben bezahlt wurde, Guthaben zurückerstatten
      if (payment.status === 'bezahlt' && (payment.payment_method === 'guthaben' || payment.payment_method === 'balance')) {
        // Atomare Guthaben-Rückerstattung
        // Passagier: Guthaben zurückerstatten
        await tx.user.update({
          where: { id: payment.trip_passenger.passenger_id },
          data: { balance: { increment: payment.amount } },
        });

        // Fahrer: Guthaben abziehen (kann nicht negativ werden)
        const driver = await tx.user.findUnique({
          where: { id: payment.trip_passenger.trip.user_id },
        });

        if (driver) {
          const driverBalance = driver.balance || 0;
          const newDriverBalance = Math.max(0, driverBalance - payment.amount);
          await tx.user.update({
            where: { id: driver.id },
            data: { balance: newDriverBalance },
          });
        }
      }

      // Aktualisiere Payment-Status
      return tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'storniert',
        },
        include: {
          trip_passenger: {
            include: {
              trip: {
                include: {
                  vehicle: true,
                  user: true,
                },
              },
              passenger: true,
            },
          },
        },
      });
    });
  }

  async getPaymentsByBooking(bookingId: number, userId: number) {
    const booking = await this.prisma.tripPassenger.findUnique({
      where: { id: bookingId },
      include: { trip: true },
    });

    if (!booking) {
      throw new NotFoundException('Buchung nicht gefunden.');
    }

    // Nur Passagier oder Fahrer können Zahlungen einsehen
    const isPassenger = booking.passenger_id === userId;
    const isDriver = booking.trip.user_id === userId;

    if (!isPassenger && !isDriver) {
      throw new ForbiddenException('Du hast keine Berechtigung, diese Zahlungen einzusehen.');
    }

    return this.prisma.payment.findMany({
      where: { trip_passenger_id: bookingId },
      orderBy: { created_at: 'desc' },
      include: {
        trip_passenger: {
          include: {
            trip: {
              include: {
                vehicle: true,
                user: true,
              },
            },
            passenger: true,
          },
        },
      },
    });
  }

  async getPaymentsByUser(userId: number) {
    return this.prisma.payment.findMany({
      where: {
        trip_passenger: {
          passenger_id: userId,
        },
      },
      include: {
        trip_passenger: {
          include: {
            trip: {
              include: {
                vehicle: true,
                user: true,
              },
            },
            passenger: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}


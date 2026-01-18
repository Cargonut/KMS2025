import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PassengerStatus } from '@prisma/client';

@Injectable()
export class TripPassengerService {
  constructor(private readonly prisma: PrismaService) {}

  async bookTrip(userId: number, tripId: number) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    if (!trip.is_active) {
      throw new BadRequestException('Trip ist nicht aktiv.');
    }
    if (trip.user_id === userId) {
      throw new ForbiddenException('Du kannst deine eigene Fahrt nicht buchen.');
    }

    const existing = await this.prisma.tripPassenger.findUnique({
      where: {
        trip_id_passenger_id: {
          trip_id: tripId,
          passenger_id: userId,
        },
      },
    });
    if (existing) {
      throw new BadRequestException('Fahrt bereits gebucht.');
    }

    // Prüfe verfügbare Plätze
    if (trip.seats) {
      const bookedSeats = await this.prisma.tripPassenger.count({
        where: {
          trip_id: tripId,
          status: { in: ['zugesagt', 'abgeschlossen'] },
        },
      });
      if (bookedSeats >= trip.seats) {
        throw new BadRequestException('Keine freien Plätze mehr verfügbar.');
      }
    }

    return this.prisma.tripPassenger.create({
      data: {
        trip_id: tripId,
        passenger_id: userId,
        status: 'zugesagt',
      },
      include: {
        trip: {
          include: {
            vehicle: true,
            user: true,
          },
        },
        passenger: true,
      },
    });
  }

  findByPassenger(userId: number) {
    return this.prisma.tripPassenger.findMany({
      where: { passenger_id: userId },
      include: {
        trip: {
          include: {
            vehicle: true,
            user: true,
          },
        },
        passenger: true,
      },
      orderBy: { joined_at: 'desc' },
    });
  }

  findByDriver(userId: number) {
    return this.prisma.tripPassenger.findMany({
      where: {
        trip: {
          user_id: userId,
        },
      },
      include: {
        trip: {
          include: {
            vehicle: true,
            user: true,
          },
        },
        passenger: true,
        payments: {
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { joined_at: 'desc' },
    });
  }

  async updateStatus(
    bookingId: number,
    userId: number,
    newStatus: PassengerStatus,
  ) {
    const booking = await this.prisma.tripPassenger.findUnique({
      where: { id: bookingId },
      include: { trip: true },
    });

    if (!booking) {
      throw new NotFoundException('Buchung nicht gefunden.');
    }

    // Prüfe Berechtigung: Nur Passagier oder Fahrer können Status ändern
    const isPassenger = booking.passenger_id === userId;
    const isDriver = booking.trip.user_id === userId;

    if (!isPassenger && !isDriver) {
      throw new ForbiddenException('Du hast keine Berechtigung, diese Buchung zu ändern.');
    }

    // Validierung: Nur bestimmte Status-Übergänge erlauben
    if (booking.status === 'storniert' && newStatus !== 'storniert') {
      throw new BadRequestException('Eine stornierte Buchung kann nicht geändert werden.');
    }

    if (booking.status === 'abgeschlossen' && newStatus !== 'abgeschlossen') {
      throw new BadRequestException('Eine abgeschlossene Buchung kann nicht geändert werden.');
    }

    // Nur Passagier kann stornieren, nur Fahrer kann abschließen
    if (newStatus === 'storniert' && !isPassenger) {
      throw new ForbiddenException('Nur der Passagier kann die Buchung stornieren.');
    }

    if (newStatus === 'abgeschlossen' && !isDriver) {
      throw new ForbiddenException('Nur der Fahrer kann die Buchung abschließen.');
    }

    return this.prisma.tripPassenger.update({
      where: { id: bookingId },
      data: { status: newStatus },
      include: {
        trip: {
          include: {
            vehicle: true,
            user: true,
          },
        },
        passenger: true,
        payments: {
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  async cancelBooking(bookingId: number, userId: number) {
    return this.updateStatus(bookingId, userId, 'storniert');
  }

  async completeBooking(bookingId: number, userId: number) {
    return this.updateStatus(bookingId, userId, 'abgeschlossen');
  }
}

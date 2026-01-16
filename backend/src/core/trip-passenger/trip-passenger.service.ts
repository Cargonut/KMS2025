import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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

    return this.prisma.tripPassenger.create({
      data: {
        trip_id: tripId,
        passenger_id: userId,
      },
      include: {
        trip: {
          include: {
            vehicle: true,
            user: true,
          },
        },
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
      },
      orderBy: { joined_at: 'desc' },
    });
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripRatingInput, TripRatingTargetRole } from './dto/create-trip-rating.input';

@Injectable()
export class TripRatingService {
  constructor(private readonly prisma: PrismaService) {}

  private validateStars(stars: number) {
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      throw new BadRequestException('Stars must be an integer between 1 and 5.');
    }
  }

  async createRating(userId: number, data: CreateTripRatingInput) {
    this.validateStars(data.stars);

    const trip = await this.prisma.trip.findUnique({
      where: { id: data.trip_id },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found.');
    }

    if (data.target_role === TripRatingTargetRole.DRIVER) {
      if (trip.user_id === userId) {
        throw new ForbiddenException('Drivers cannot rate themselves.');
      }

      const booking = await this.prisma.tripPassenger.findUnique({
        where: {
          trip_id_passenger_id: {
            trip_id: data.trip_id,
            passenger_id: userId,
          },
        },
      });

      if (!booking) {
        throw new ForbiddenException('You can only rate trips you joined as passenger.');
      }

      const existing = await this.prisma.tripRatingDriver.findFirst({
        where: {
          trip_id: data.trip_id,
          driver_id: trip.user_id,
          passenger_id: userId,
        },
      });

      if (existing) {
        throw new BadRequestException('Rating already exists for this trip.');
      }

      return this.prisma.tripRatingDriver.create({
        data: {
          trip_id: data.trip_id,
          driver_id: trip.user_id,
          passenger_id: userId,
          stars: data.stars,
          comment: data.comment ?? null,
          punctuality: data.punctuality ?? null,
          adherence: data.adherence ?? null,
          comfort: data.comfort ?? null,
          cargo_condition: data.cargo_condition ?? null,
        },
        include: {
          trip: true,
          driver: true,
          passenger: true,
        },
      });
    }

    if (trip.user_id !== userId) {
      throw new ForbiddenException('Only the driver can rate passengers.');
    }

    if (!data.passenger_id) {
      throw new BadRequestException('passenger_id is required to rate a passenger.');
    }

    if (data.passenger_id === userId) {
      throw new BadRequestException('Drivers cannot rate themselves.');
    }

    const passengerBooking = await this.prisma.tripPassenger.findUnique({
      where: {
        trip_id_passenger_id: {
          trip_id: data.trip_id,
          passenger_id: data.passenger_id,
        },
      },
    });

    if (!passengerBooking) {
      throw new NotFoundException('Passenger is not booked on this trip.');
    }

    const existing = await this.prisma.tripRatingPassenger.findFirst({
      where: {
        trip_id: data.trip_id,
        driver_id: userId,
        passenger_id: data.passenger_id,
      },
    });

    if (existing) {
      throw new BadRequestException('Rating already exists for this trip.');
    }

    return this.prisma.tripRatingPassenger.create({
      data: {
        trip_id: data.trip_id,
        driver_id: userId,
        passenger_id: data.passenger_id,
        stars: data.stars,
        comment: data.comment ?? null,
        punctuality: data.punctuality ?? null,
        adherence: data.adherence ?? null,
        friendliness: data.friendliness ?? null,
      },
      include: {
        trip: true,
        driver: true,
        passenger: true,
      },
    });
  }

  async getRatingsForUser(userId: number) {
    const [asDriver, asPassenger] = await Promise.all([
      this.prisma.tripRatingDriver.findMany({
        where: { driver_id: userId },
        include: { trip: true, driver: true, passenger: true },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.tripRatingPassenger.findMany({
        where: { passenger_id: userId },
        include: { trip: true, driver: true, passenger: true },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return {
      as_driver: asDriver,
      as_passenger: asPassenger,
    };
  }
}

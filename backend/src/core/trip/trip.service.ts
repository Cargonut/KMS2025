import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripInput } from './dto/create-trip.input';
import { UpdateTripInput } from './dto/update-trip.input';

@Injectable()
export class TripService {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------------------------
  // PUBLIC: Alle Trips
  // ----------------------------------------------------
  findAll() {
    return this.prisma.trip.findMany({
      include: {
        vehicle: true,
        user: true,
      },
    });
  }

  // ----------------------------------------------------
  // PUBLIC: Einzelner Trip
  // ----------------------------------------------------
  async findOne(id: number) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        user: true,
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  // ----------------------------------------------------
  // CREATE TRIP (userId kommt aus JWT)
  // ----------------------------------------------------
  async createTrip(userId: number, data: CreateTripInput) {
    console.log("INPUT DATA:", data);

    return this.prisma.trip.create({
      data: {
        type: data.type,
        from_location: data.from_location,
        to_location: data.to_location,
        via: data.via ?? null,

        start_date: data.start_date,  // ← ALREADY A DATE
        end_date: data.end_date ?? null,

        weight: data.weight ?? null,
        seats: data.seats ?? null,
        price: data.price ?? null,
        restrictions: data.restrictions ?? null,

        user_id: userId,
        vehicle_id: data.vehicle_id ?? null,
      },
      include: {
        vehicle: true,
        user: true,
      },
    });
  }

  // ----------------------------------------------------
  // UPDATE TRIP (nur Owner)
  // ----------------------------------------------------
  async updateTrip(id: number, userId: number, data: UpdateTripInput) {
    const existing = await this.prisma.trip.findUnique({ where: { id } });

    if (!existing) throw new NotFoundException('Trip not found');
    if (existing.user_id !== userId)
      throw new ForbiddenException('You may only edit your own trips.');

    return this.prisma.trip.update({
      where: { id },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.from_location !== undefined && { from_location: data.from_location }),
        ...(data.to_location !== undefined && { to_location: data.to_location }),
        ...(data.via !== undefined && { via: data.via }),

        ...(data.start_date !== undefined && { start_date: data.start_date }),
        ...(data.end_date !== undefined && { end_date: data.end_date ?? null }),

        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.seats !== undefined && { seats: data.seats }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.restrictions !== undefined && { restrictions: data.restrictions }),

        ...(data.vehicle_id !== undefined && { vehicle_id: data.vehicle_id }),
      },
      include: {
        vehicle: true,
        user: true,
      },
    });
  }

  // ----------------------------------------------------
  // DELETE TRIP (nur Owner)
  // ----------------------------------------------------
  async deleteTrip(id: number, userId: number) {
    const existing = await this.prisma.trip.findUnique({ where: { id } });

    if (!existing) throw new NotFoundException('Trip not found');
    if (existing.user_id !== userId)
      throw new ForbiddenException('You may only delete your own trips.');

    await this.prisma.trip.delete({ where: { id } });
    return true;
  }
}

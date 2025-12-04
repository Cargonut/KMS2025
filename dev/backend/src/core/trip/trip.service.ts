import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripInput } from './dto/create-trip.input';
import { UpdateTripInput } from './dto/update-trip.input';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.trip.findMany();
  }

  findOne(id: number) {
    return this.prisma.trip.findUnique({ where: { id } });
  }

  async create(data: CreateTripInput) {
    return this.prisma.trip.create({
      data: {
        type: data.type,
        from_location: data.from_location,
        to_location: data.to_location,
        via: data.via,
        start_date: data.start_date,
        end_date: data.end_date,
        weight: data.weight,
        seats: data.seats,
        price: data.price,
        restrictions: data.restrictions,

        // ⭐ Relation: User
        user: {
          connect: { id: data.user_id },
        },

        // ⭐ Relation: Vehicle (optional)
        vehicle: data.vehicle_id
          ? {
              connect: { id: data.vehicle_id },
            }
          : undefined,
      },
    });
  }

  async update(id: number, data: UpdateTripInput) {
    return this.prisma.trip.update({
      where: { id },
      data: {
        type: data.type,
        from_location: data.from_location,
        to_location: data.to_location,
        via: data.via,
        start_date: data.start_date,
        end_date: data.end_date,
        weight: data.weight,
        seats: data.seats,
        price: data.price,
        restrictions: data.restrictions,

        // optional user update
        user: data.user_id
          ? { connect: { id: data.user_id } }
          : undefined,

        vehicle: data.vehicle_id
          ? { connect: { id: data.vehicle_id } }
          : undefined,
      },
    });
  }

  delete(id: number) {
    return this.prisma.trip.delete({ where: { id } });
  }
}

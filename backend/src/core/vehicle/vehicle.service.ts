import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleInput } from './dto/create-vehicle.input';
import { UpdateVehicleInput } from './dto/update-vehicle.input';

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------------------------------------
  // GET ALL VEHICLES
  // ---------------------------------------------------------
  findAll() {
    return this.prisma.vehicle.findMany();
  }

  // ---------------------------------------------------------
  // GET ONE VEHICLE BY ID
  // ---------------------------------------------------------
  async findOne(id: number) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) throw new NotFoundException('Vehicle not found.');

    return vehicle;
  }

  // ---------------------------------------------------------
  // CREATE VEHICLE (Owner = current user)
  // ---------------------------------------------------------
  create(userId: number, data: CreateVehicleInput) {
    return this.prisma.vehicle.create({
      data: {
        user_id: userId,
        name: data.name,
        special_features: data.special_features,
        weight: data.weight,
        dimensions: data.dimensions,
      },
    });
  }

  // ---------------------------------------------------------
  // UPDATE VEHICLE (only owner allowed)
  // ---------------------------------------------------------
  async update(userId: number, id: number, data: UpdateVehicleInput) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) throw new NotFoundException('Vehicle not found.');
    if (vehicle.user_id !== userId)
      throw new ForbiddenException('You do not own this vehicle.');

    return this.prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  // ---------------------------------------------------------
  // DELETE VEHICLE (only owner allowed)
  // ---------------------------------------------------------
  async delete(userId: number, id: number) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) throw new NotFoundException('Vehicle not found.');
    if (vehicle.user_id !== userId)
      throw new ForbiddenException('You do not own this vehicle.');

    await this.prisma.vehicle.delete({
      where: { id },
    });

    return true;
  }
}

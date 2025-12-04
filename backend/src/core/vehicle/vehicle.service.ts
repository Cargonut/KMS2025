import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.vehicle.findMany();
  }

  findOne(id: number) {
    return this.prisma.vehicle.findUnique({ where: { id } });
  }
}

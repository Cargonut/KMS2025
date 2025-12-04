import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}

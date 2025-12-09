import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { VehicleResolver } from '../../api/graphql/vehicle.resolver';

@Module({
  imports: [PrismaModule],
  providers: [VehicleService, VehicleResolver],
  exports: [VehicleService],
})
export class VehicleModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TripPassengerResolver } from '../../api/graphql/trip-passenger.resolver';
import { TripPassengerService } from './trip-passenger.service';

@Module({
  imports: [PrismaModule],
  providers: [TripPassengerResolver, TripPassengerService],
  exports: [TripPassengerService],
})
export class TripPassengerModule {}

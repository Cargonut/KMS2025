import { Module } from '@nestjs/common';
import { TripResolver } from '../../api/graphql/trip.resolver';
import { TripService } from '../trip/trip.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TripResolver, TripService],
  exports: [TripService],
})
export class TripModule {}

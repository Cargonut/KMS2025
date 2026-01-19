import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TripRatingResolver } from '../../api/graphql/trip-rating.resolver';
import { TripRatingService } from './trip-rating.service';

@Module({
  imports: [PrismaModule],
  providers: [TripRatingResolver, TripRatingService],
})
export class TripRatingModule {}

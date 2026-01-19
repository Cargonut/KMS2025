import { ObjectType, Field } from '@nestjs/graphql';
import { TripRatingDriver } from './trip-rating-driver.entity';
import { TripRatingPassenger } from './trip-rating-passenger.entity';

@ObjectType()
export class TripRatingResult {
  @Field(() => TripRatingDriver, { nullable: true })
  driver_rating?: TripRatingDriver;

  @Field(() => TripRatingPassenger, { nullable: true })
  passenger_rating?: TripRatingPassenger;
}

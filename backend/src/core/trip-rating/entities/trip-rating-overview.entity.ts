import { ObjectType, Field } from '@nestjs/graphql';
import { TripRatingDriver } from './trip-rating-driver.entity';
import { TripRatingPassenger } from './trip-rating-passenger.entity';

@ObjectType()
export class TripRatingOverview {
  @Field(() => [TripRatingDriver], { nullable: 'itemsAndList' })
  as_driver?: TripRatingDriver[];

  @Field(() => [TripRatingPassenger], { nullable: 'itemsAndList' })
  as_passenger?: TripRatingPassenger[];
}

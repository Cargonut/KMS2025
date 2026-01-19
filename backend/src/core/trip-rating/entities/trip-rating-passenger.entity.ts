import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Trip } from '../../trip/entities/trip.entity';
import { User } from '../../user/entities/user.entity';

@ObjectType()
export class TripRatingPassenger {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  trip_id: number;

  @Field(() => Int)
  passenger_id: number;

  @Field(() => Int)
  driver_id: number;

  @Field(() => Int)
  stars: number;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => Int, { nullable: true })
  punctuality?: number;

  @Field(() => Int, { nullable: true })
  adherence?: number;

  @Field(() => Int, { nullable: true })
  friendliness?: number;

  @Field()
  created_at: Date;

  @Field(() => Trip, { nullable: true })
  trip?: Trip;

  @Field(() => User, { nullable: true })
  passenger?: User;

  @Field(() => User, { nullable: true })
  driver?: User;
}

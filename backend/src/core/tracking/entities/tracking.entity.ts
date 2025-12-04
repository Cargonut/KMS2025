import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Trip } from '../../trip/entities/trip.entity';

@ObjectType()
export class TripTracking {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  trip_id: number;

  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field({ nullable: true })
  status?: string;

  @Field()
  updated_at: Date;

  @Field(() => Trip, { nullable: true })
  trip?: Trip;
}

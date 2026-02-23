import { ObjectType, Field, Float, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class NearbyDriver {
  @Field(() => ID)
  trip_id: number;

  @Field(() => Int)
  driver_id: number;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field(() => Float)
  distance_km: number;

  @Field({ nullable: true })
  status?: string;

  @Field()
  updated_at: Date;

  @Field()
  from_location: string;

  @Field()
  to_location: string;
}

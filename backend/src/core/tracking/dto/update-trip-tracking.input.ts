import { InputType, Field, Float, Int } from '@nestjs/graphql';

@InputType()
export class UpdateTripTrackingInput {
  @Field(() => Int)
  trip_id: number;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Float, { nullable: true })
  speed?: number;

  @Field(() => Float, { nullable: true })
  heading?: number;

  @Field(() => Float, { nullable: true })
  accuracy?: number;
}

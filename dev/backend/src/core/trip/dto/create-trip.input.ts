import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { TripType } from '@prisma/client';

@InputType()
export class CreateTripInput {
  @Field(() => Int)
  user_id: number;

  @Field(() => TripType)
  type: TripType;

  @Field()
  from_location: string;

  @Field()
  to_location: string;

  @Field({ nullable: true })
  via?: string;

  @Field()
  start_date: Date;

  @Field({ nullable: true })
  end_date?: Date;

  @Field(() => Int, { nullable: true })
  vehicle_id?: number;

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field(() => Int, { nullable: true })
  seats?: number;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field({ nullable: true })
  restrictions?: string;
}

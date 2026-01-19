import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';

export enum TripRatingTargetRole {
  DRIVER = 'DRIVER',
  PASSENGER = 'PASSENGER',
}

registerEnumType(TripRatingTargetRole, {
  name: 'TripRatingTargetRole',
});

@InputType()
export class CreateTripRatingInput {
  @Field(() => Int)
  trip_id: number;

  @Field(() => TripRatingTargetRole)
  target_role: TripRatingTargetRole;

  @Field(() => Int, { nullable: true })
  passenger_id?: number;

  @Field(() => Int)
  stars: number;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => Int, { nullable: true })
  punctuality?: number;

  @Field(() => Int, { nullable: true })
  adherence?: number;

  @Field(() => Int, { nullable: true })
  comfort?: number;

  @Field(() => Int, { nullable: true })
  cargo_condition?: number;

  @Field(() => Int, { nullable: true })
  friendliness?: number;
}

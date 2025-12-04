import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { Trip } from '../../trip/entities/trip.entity';

@ObjectType()
export class Vehicle {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  user_id: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  special_features?: string;

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field({ nullable: true })
  dimensions?: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [Trip], { nullable: 'itemsAndList' })
  trips?: Trip[];
}

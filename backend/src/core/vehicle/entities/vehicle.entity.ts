import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { MotorType } from '@prisma/client';
import { User } from '../../user/entities/user.entity';
import { Trip } from '../../trip/entities/trip.entity';

registerEnumType(MotorType, {
  name: 'MotorType',
});

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

  @Field(() => Float, { nullable: true })
  load_area?: number;

  @Field(() => MotorType, { nullable: true })
  motor_type?: MotorType;

  @Field(() => [String], { nullable: 'itemsAndList' })
  image_urls?: string[];

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [Trip], { nullable: 'itemsAndList' })
  trips?: Trip[];
}

import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { Trip } from '../../trip/entities/trip.entity';
import { Payment } from '../../payment/entities/payment.entity';

@ObjectType()
export class TripPassenger {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  trip_id: number;

  @Field(() => Int)
  passenger_id: number;

  @Field()
  joined_at: Date;

  @Field()
  status: string; // zugesagt | storniert | abgeschlossen

  @Field(() => Trip, { nullable: true })
  trip?: Trip;

  @Field(() => User, { nullable: true })
  passenger?: User;

  @Field(() => [Payment], { nullable: true })
  payments?: Payment[];
}

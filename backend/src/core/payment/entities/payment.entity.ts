import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { TripPassenger } from '../../trip-passenger/entities/trip-passenger.entity';

@ObjectType()
export class Payment {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  trip_passenger_id: number;

  @Field(() => Float)
  amount: number;

  @Field()
  status: string; // ausstehend | bezahlt | storniert | fehlgeschlagen

  @Field({ nullable: true })
  payment_method?: string;

  @Field({ nullable: true })
  transaction_id?: string;

  @Field({ nullable: true })
  paid_at?: Date;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;

  @Field(() => TripPassenger, { nullable: true })
  trip_passenger?: TripPassenger;
}


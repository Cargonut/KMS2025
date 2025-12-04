import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Trip } from '../../trip/entities/trip.entity';




@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  first_name: string;

  @Field()
  last_name: string;

  @Field()
  email: string;

  @Field()
  birth_date: Date;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  profile_image?: string;

  @Field({ nullable: true })
  additional_note?: string;

  @Field({ nullable: true })
  created_at: Date;

  @Field(() => [Trip], { nullable: true })
  trips?: Trip[];

}

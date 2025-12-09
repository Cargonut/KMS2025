import { ObjectType, Field, ID, Float, Int, GraphQLISODateTime } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { Vehicle } from '../../vehicle/entities/vehicle.entity';
import { TripPassenger } from '../../trip-passenger/entities/trip-passenger.entity';
import { TripRatingDriver } from '../../trip-rating/entities/trip-rating-driver.entity';
import { TripRatingPassenger } from '../../trip-rating/entities/trip-rating-passenger.entity';
import { TripTracking } from '../../tracking/entities/tracking.entity';
import { registerEnumType } from '@nestjs/graphql';
import { TripType } from '@prisma/client';

registerEnumType(TripType, {
    name: 'TripType',
});

@ObjectType()
export class Trip {
    @Field(() => ID)
    id: number;

    @Field(() => TripType)
    type: TripType;

    @Field(() => Int)
    user_id: number;

    @Field()
    from_location: string;

    @Field()
    to_location: string;

    @Field({ nullable: true })
    via?: string;

    // ⬇️ WICHTIG: ISO DATE TYPE
    @Field(() => GraphQLISODateTime)
    start_date: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    end_date?: Date;

    @Field(() => Int, { nullable: true })
    vehicle_id?: number;

    @Field(() => Float, { nullable: true })
    weight?: number;

    @Field(() => Int, { nullable: true })
    seats?: number;

    @Field(() => Float, { nullable: true })
    price?: number;

    @Field()
    is_active: boolean;

    @Field({ nullable: true })
    restrictions?: string;

    // 🔥 RELATIONEN
    @Field(() => User, { nullable: true })
    user?: User;

    @Field(() => Vehicle, { nullable: true })
    vehicle?: Vehicle;

    @Field(() => [TripPassenger], { nullable: 'itemsAndList' })
    passengers?: TripPassenger[];

    @Field(() => [TripRatingDriver], { nullable: 'itemsAndList' })
    ratings_driver?: TripRatingDriver[];

    @Field(() => [TripRatingPassenger], { nullable: 'itemsAndList' })
    ratings_passenger?: TripRatingPassenger[];

    @Field(() => [TripTracking], { nullable: 'itemsAndList' })
    tracking?: TripTracking[];
}

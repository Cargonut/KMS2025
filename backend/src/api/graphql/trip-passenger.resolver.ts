import { Resolver, Mutation, Args, Int, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TripPassenger } from '../../core/trip-passenger/entities/trip-passenger.entity';
import { TripPassengerService } from '../../core/trip-passenger/trip-passenger.service';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@Resolver(() => TripPassenger)
export class TripPassengerResolver {
  constructor(private readonly tripPassengerService: TripPassengerService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TripPassenger)
  async bookTrip(
    @CurrentUser() user: any,
    @Args('tripId', { type: () => Int }) tripId: number,
  ) {
    return this.tripPassengerService.bookTrip(user.id, tripId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [TripPassenger], { name: 'myTripBookings', nullable: 'itemsAndList' })
  async myTripBookings(@CurrentUser() user: any) {
    if (!user?.id) {
      return [];
    }
    return this.tripPassengerService.findByPassenger(user.id);
  }
}

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

  @UseGuards(GqlAuthGuard)
  @Query(() => [TripPassenger], { name: 'myTripPassengers', nullable: 'itemsAndList' })
  async myTripPassengers(@CurrentUser() user: any) {
    if (!user?.id) {
      return [];
    }
    return this.tripPassengerService.findByDriver(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TripPassenger)
  async cancelBooking(
    @CurrentUser() user: any,
    @Args('bookingId', { type: () => Int }) bookingId: number,
  ) {
    return this.tripPassengerService.cancelBooking(bookingId, user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TripPassenger)
  async completeBooking(
    @CurrentUser() user: any,
    @Args('bookingId', { type: () => Int }) bookingId: number,
  ) {
    return this.tripPassengerService.completeBooking(bookingId, user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TripPassenger)
  async updateBookingStatus(
    @CurrentUser() user: any,
    @Args('bookingId', { type: () => Int }) bookingId: number,
    @Args('status') status: string,
  ) {
    if (status === 'storniert') {
      return this.tripPassengerService.cancelBooking(bookingId, user.id);
    }
    if (status === 'abgeschlossen') {
      return this.tripPassengerService.completeBooking(bookingId, user.id);
    }
    throw new Error('Ungültiger Status. Erlaubt: storniert, abgeschlossen');
  }
}

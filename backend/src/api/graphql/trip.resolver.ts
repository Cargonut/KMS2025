import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { TripService } from '../../core/trip/trip.service';
import { CreateTripInput } from '../../core/trip/dto/create-trip.input';
import { UpdateTripInput } from '../../core/trip/dto/update-trip.input';
import { Trip } from '../../core/trip/entities/trip.entity';

import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@Resolver(() => Trip)
export class TripResolver {
  constructor(private readonly tripService: TripService) {}

  // ----------------------------------------------------
  // GET ALL TRIPS (Public)
  // ----------------------------------------------------
  @Query(() => [Trip])
  async trips() {
    return this.tripService.findAll();
  }

  // ----------------------------------------------------
  // GET SINGLE TRIP (Public)
  // ----------------------------------------------------
  @Query(() => Trip)
  async trip(@Args('id', { type: () => Int }) id: number) {
    return this.tripService.findOne(id);
  }

  // ----------------------------------------------------
  // CREATE TRIP (Requires Auth)
  // ----------------------------------------------------
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Trip)
  async createTrip(
    @CurrentUser() user: { id: number },
    @Args('data', { type: () => CreateTripInput }) data: CreateTripInput,
  ) {
    return this.tripService.createTrip(user.id, data);
  }

  // ----------------------------------------------------
  // UPDATE TRIP (Requires Auth + Ownership)
  // ----------------------------------------------------
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Trip)
  async updateTrip(
    @CurrentUser() user: { id: number },
    @Args('data', { type: () => UpdateTripInput }) data: UpdateTripInput,
  ) {
    return this.tripService.updateTrip(data.id, user.id, data);
  }

  // ----------------------------------------------------
  // DELETE TRIP (Requires Auth + Ownership)
  // ----------------------------------------------------
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteTrip(
    @CurrentUser() user: { id: number },
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.tripService.deleteTrip(id, user.id);
  }
}

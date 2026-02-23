import { Resolver, Mutation, Query, Args, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { TripTracking } from '../../core/tracking/entities/tracking.entity';
import { TrackingService } from '../../core/tracking/tracking.service';
import { UpdateTripTrackingInput } from '../../core/tracking/dto/update-trip-tracking.input';
import { NearbyDriver } from '../../core/tracking/entities/nearby-driver.entity';

@Resolver()
export class TrackingResolver {
  constructor(private readonly trackingService: TrackingService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TripTracking)
  async updateTripTracking(
    @CurrentUser() user: { id: number },
    @Args('input') input: UpdateTripTrackingInput,
  ) {
    return this.trackingService.updateTripTracking(user.id, input);
  }

  @Query(() => [NearbyDriver])
  async nearbyDrivers(
    @Args('lat', { type: () => Float }) lat: number,
    @Args('lng', { type: () => Float }) lng: number,
    @Args('radiusKm', { type: () => Float, nullable: true }) radiusKm = 15,
  ) {
    return this.trackingService.nearbyDrivers(lat, lng, radiusKm);
  }
}

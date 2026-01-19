import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TripRatingDriver } from '../../core/trip-rating/entities/trip-rating-driver.entity';
import { TripRatingResult } from '../../core/trip-rating/entities/trip-rating-result.entity';
import { TripRatingOverview } from '../../core/trip-rating/entities/trip-rating-overview.entity';
import { CreateTripRatingInput, TripRatingTargetRole } from '../../core/trip-rating/dto/create-trip-rating.input';
import { TripRatingService } from '../../core/trip-rating/trip-rating.service';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { User } from '../../core/user/entities/user.entity';

@Resolver(() => TripRatingDriver)
export class TripRatingResolver {
  constructor(private readonly tripRatingService: TripRatingService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => TripRatingResult)
  async createTripRating(
    @CurrentUser() user: User,
    @Args('data', { type: () => CreateTripRatingInput }) data: CreateTripRatingInput,
  ) {
    const rating = await this.tripRatingService.createRating(user.id, data);

    if (data.target_role === TripRatingTargetRole.DRIVER) {
      return { driver_rating: rating };
    }

    return { passenger_rating: rating };
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => TripRatingOverview)
  async myRatings(@CurrentUser() user: User) {
    return this.tripRatingService.getRatingsForUser(user.id);
  }
}

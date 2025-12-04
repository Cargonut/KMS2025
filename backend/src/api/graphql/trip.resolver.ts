import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { Trip } from '../../core/trip/entities/trip.entity';
import { TripService } from '../../core/trip/trip.service';
import { CreateTripInput } from '../../core/trip/dto/create-trip.input';
import { UpdateTripInput } from '../../core/trip/dto/update-trip.input';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../../core/user/entities/user.entity';
import { Vehicle } from '../../core/vehicle/entities/vehicle.entity';

@Resolver(() => Trip)
export class TripResolver {
  constructor(
    private tripService: TripService,
    private prisma: PrismaService
  ) {}

  // GET /trips
  @Query(() => [Trip])
  async trips() {
    return this.tripService.findAll();
  }

  // GET /trip/:id
  @Query(() => Trip, { nullable: true })
  async trip(@Args('id', { type: () => Int }) id: number) {
    return this.tripService.findOne(id);
  }

  // CREATE Trip
  @Mutation(() => Trip)
  createTrip(@Args('data') data: CreateTripInput) {
    return this.tripService.create(data);
  }

  // UPDATE Trip
  @Mutation(() => Trip)
  updateTrip(@Args('data') data: UpdateTripInput) {
    return this.tripService.update(data.id, data);
  }

  // DELETE Trip
  @Mutation(() => Boolean)
  async deleteTrip(@Args('id', { type: () => Int }) id: number) {
    await this.tripService.delete(id);
    return true;
  }

  // Relation: Trip.user
  @ResolveField(() => User, { nullable: true })
  async user(@Parent() trip: Trip) {
    return this.prisma.user.findUnique({
      where: { id: trip.user_id },
    });
  }

  // Relation: Trip.vehicle
  @ResolveField(() => Vehicle, { nullable: true })
  async vehicle(@Parent() trip: Trip) {
    if (!trip.vehicle_id) return null;
    return this.prisma.vehicle.findUnique({
      where: { id: trip.vehicle_id },
    });
  }
}

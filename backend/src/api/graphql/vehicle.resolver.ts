import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { VehicleService } from '../../core/vehicle/vehicle.service';
import { Vehicle } from '../../core/vehicle/entities/vehicle.entity';
import { CreateVehicleInput } from '../../core/vehicle/dto/create-vehicle.input';
import { UpdateVehicleInput } from '../../core/vehicle/dto/update-vehicle.input';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@Resolver(() => Vehicle)
export class VehicleResolver {
  constructor(private readonly vehicleService: VehicleService) {}

  // -------------------------------------------------------
  // GET ONE VEHICLE
  // -------------------------------------------------------
  @Query(() => Vehicle, { name: 'vehicle' })
  async getVehicle(@Args('id', { type: () => Int }) id: number) {
    return this.vehicleService.findOne(id);
  }

  // -------------------------------------------------------
  // GET ALL VEHICLES
  // -------------------------------------------------------
  @Query(() => [Vehicle], { name: 'vehicles' })
  async getVehicles() {
    return this.vehicleService.findAll();
  }

  // -------------------------------------------------------
  // CREATE VEHICLE
  // -------------------------------------------------------
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Vehicle)
  async createVehicle(
    @CurrentUser() user: any,
    @Args('data') data: CreateVehicleInput,
  ) {
    return this.vehicleService.create(user.id, data);
  }

  // -------------------------------------------------------
  // UPDATE VEHICLE
  // -------------------------------------------------------
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Vehicle)
  async updateVehicle(
    @CurrentUser() user: any,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateVehicleInput,
  ) {
    return this.vehicleService.update(user.id, id, data);
  }

  // -------------------------------------------------------
  // DELETE VEHICLE
  // -------------------------------------------------------
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteVehicle(
    @CurrentUser() user: any,
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.vehicleService.delete(user.id, id);
  }
}

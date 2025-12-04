import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Vehicle } from '../../core/vehicle/entities/vehicle.entity';
import { VehicleService } from '../../core/vehicle/vehicle.service';

@Resolver(() => Vehicle)
export class VehicleResolver {
  constructor(private vehicleService: VehicleService) {}

  @Query(() => [Vehicle])
  vehicles() {
    return this.vehicleService.findAll();
  }

  @Query(() => Vehicle, { nullable: true })
  vehicle(@Args('id', { type: () => Int }) id: number) {
    return this.vehicleService.findOne(id);
  }
}

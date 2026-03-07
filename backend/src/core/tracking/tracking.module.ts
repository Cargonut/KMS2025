import { Module } from '@nestjs/common';
import { TrackingResolver } from '../../api/graphql/tracking.resolver';
import { TrackingService } from './tracking.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TrackingResolver, TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PaymentService } from './payment.service';
import { PaymentResolver } from '../../api/graphql/payment.resolver';

@Module({
  imports: [PrismaModule],
  providers: [PaymentService, PaymentResolver],
  exports: [PaymentService],
})
export class PaymentModule {}


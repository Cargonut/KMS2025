import { Resolver, Mutation, Args, Int, Query, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Payment } from '../../core/payment/entities/payment.entity';
import { PaymentService } from '../../core/payment/payment.service';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@Resolver(() => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Payment)
  async createPayment(
    @CurrentUser() user: any,
    @Args('bookingId', { type: () => Int }) bookingId: number,
    @Args('amount', { type: () => Float }) amount: number,
    @Args('paymentMethod', { nullable: true }) paymentMethod?: string,
  ) {
    return this.paymentService.createPayment(bookingId, user.id, amount, paymentMethod);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Payment)
  async confirmPayment(
    @CurrentUser() user: any,
    @Args('paymentId', { type: () => Int }) paymentId: number,
  ) {
    return this.paymentService.confirmPayment(paymentId, user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Payment)
  async cancelPayment(
    @CurrentUser() user: any,
    @Args('paymentId', { type: () => Int }) paymentId: number,
  ) {
    return this.paymentService.cancelPayment(paymentId, user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Payment], { name: 'paymentsByBooking', nullable: 'itemsAndList' })
  async paymentsByBooking(
    @CurrentUser() user: any,
    @Args('bookingId', { type: () => Int }) bookingId: number,
  ) {
    return this.paymentService.getPaymentsByBooking(bookingId, user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Payment], { name: 'myPayments', nullable: 'itemsAndList' })
  async myPayments(@CurrentUser() user: any) {
    if (!user?.id) {
      return [];
    }
    return this.paymentService.getPaymentsByUser(user.id);
  }
}


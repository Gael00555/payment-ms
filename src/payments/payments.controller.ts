import {Controller,Post,Body,Get,Req,Headers,BadRequestException,} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession(
    @Body() dto: CreatePaymentSessionDto,
  ): Promise<Stripe.Checkout.Session> {
    return this.paymentsService.createPaymentSession(dto);
  }

  @Get('success')
  paymentSuccess(): { ok: boolean; message: string } {
    return { ok: true, message: 'Payment successful' };
  }

  @Get('cancel')
  paymentCancel(): { ok: boolean; message: string } {
    return { ok: false, message: 'Payment cancelled' };
  }

  @Post('webhook')
  handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = request.rawBody as Buffer;
    let event: Stripe.Event;

    try {
      event = this.paymentsService.handleWebhook(rawBody, signature);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(message);
    }

    if (event.type === 'charge.succeeded') {
      const orderId = (event.data.object as Stripe.Charge).metadata.orderId;
      console.log('orderId pagado:', orderId);
    } else {
      console.log('Evento no manejado:', event.type);
    }

    return { received: true };
  }
}
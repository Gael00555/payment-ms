import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.getRequiredEnv('STRIPE_SECRET'));
  }

  private getRequiredEnv(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`${key} no está definido en las variables de entorno`);
    }
    return value;
  }

  async createPaymentSession(dto: CreatePaymentSessionDto):Promise<Stripe.Checkout.Session> {
    const lineItems = dto.items.map((item) => ({
      price_data: {
        currency: dto.currency,
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: this.getRequiredEnv('STRIPE_SUCCESS_URL'),
      cancel_url: this.getRequiredEnv('STRIPE_CANCEL_URL'),
      payment_intent_data: {
        metadata: { orderId: dto.orderId },
      },
    });

    return session;
  }
  handleWebhook(rawBody: Buffer, signature: string): Stripe.Event {
  const endpointSecret = this.getRequiredEnv('STRIPE_ENDPOINT_SECRET');

  try {
    const event = this.stripe.webhooks.constructEvent(rawBody,signature,endpointSecret,);
    return event;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Webhook signature verification failed: ${message}`);
  }
}
}


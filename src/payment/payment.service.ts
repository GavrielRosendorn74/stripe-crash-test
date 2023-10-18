import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';

export const HAS_STOCK = true;

@Injectable()
export class PaymentService {
  private stripe : Stripe = new Stripe(
    "YOUR_SECRET_KEY",
    {apiVersion: '2023-10-16'}  
  );

  async createCheckout() {
    const product = await this.stripe.products.create({
      name: "UNE BOITE D'AVOINE"
    });
    const price = await this.stripe.prices.create({
      product: product.id,
      currency: 'eur',
      unit_amount: 5000
    });
    const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        payment_intent_data: {
          capture_method: 'manual'
        },
        mode: 'payment',
        success_url: `http://localhost:3000/payment/success-payment-handler?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:5500/fail.html`,
      });

    return {
      url: session.url
    };
  }

  async successPaymentHandler(req : Request, res : Response) {
    const session_id = req.query.session_id;
    const session = await this.stripe.checkout.sessions.retrieve(session_id as string);
    if (HAS_STOCK) {
      const paymentIntent = await this.stripe.paymentIntents.capture(session.payment_intent as string);
      if (paymentIntent.status == 'succeeded') {
        res.redirect("http://localhost:5500/success.html");
        return ;
      }
    } else {
      const paymentIntent = await this.stripe.paymentIntents.cancel(session.payment_intent as string);
      if (paymentIntent.status == 'canceled') {
        res.redirect("http://localhost:5500/fail_out_of_stock.html");
        return ;
      }
    }
    res.redirect("http://localhost:5500/fail.html");
    return ;
  }
}

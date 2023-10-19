import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { EmailService } from 'src/email/email.service';
import Stripe from 'stripe';

export const HAS_STOCK = true;

@Injectable()
export class PaymentService {
  private stripe : Stripe = new Stripe(
    "YOUR_KEY",
    {apiVersion: '2023-10-16'}  
  );

  constructor(
    private emailService : EmailService
  ) {}

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
        try {
          await this.emailService.send(
            session.customer_details.email,
            "Merci d'avoir commandé !",
            `Bonjour ${session.customer_details.name},
  
  Merci d'avoir aceter de l'avoine chez nous pour ${session.amount_total / 100} euros.
  
  Team Avoine`
          );
        } catch (e) {
          console.log(e);
        }
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

/*

{
  id: 'cs_test_a1nKZcS2VH2Uce7yTnbDZtfCxFlIIXccIHK6Ymbv5QNMht08YfKgy9WM3U',
  object: 'checkout.session',
  after_expiration: null,
  allow_promotion_codes: null,
  amount_subtotal: 5000,
  amount_total: 5000,
  automatic_tax: { enabled: false, status: null },
  billing_address_collection: null,
  cancel_url: 'http://localhost:5500/fail.html',
  client_reference_id: null,
  client_secret: null,
  consent: null,
  consent_collection: null,
  created: 1697705898,
  currency: 'eur',
  currency_conversion: null,
  custom_fields: [],
  custom_text: {
    shipping_address: null,
    submit: null,
    terms_of_service_acceptance: null
  },
  customer: null,
  customer_creation: 'if_required',
  customer_details: {
    address: {
      city: 'reignier',
      country: 'FR',
      line1: '151 rue des Lavandières',
      line2: null,
      postal_code: '74930',
      state: null
    },
    email: 'rosendorngavriel@gmail.com',
    name: 'rosendorn gavriel',
    phone: null,
    tax_exempt: 'none',
    tax_ids: []
  },
  customer_email: null,
  expires_at: 1697792298,
  invoice: null,
  invoice_creation: {
    enabled: false,
    invoice_data: {
      account_tax_ids: null,
      custom_fields: null,
      description: null,
      footer: null,
      metadata: {},
      rendering_options: null
    }
  },
  livemode: false,
  locale: null,
  metadata: {},
  mode: 'payment',
  payment_intent: 'pi_3O2s42I4h5RBISH60RiW8YNv',
  payment_link: null,
  payment_method_collection: 'if_required',
  payment_method_configuration_details: { id: 'pmc_1M0nAuI4h5RBISH6lDfLRfjR', parent: null },
  payment_method_options: {},
  payment_method_types: [ 'card' ],
  payment_status: 'unpaid',
  phone_number_collection: { enabled: false },
  recovered_from: null,
  setup_intent: null,
  shipping_address_collection: null,
  shipping_cost: null,
  shipping_details: null,
  shipping_options: [],
  status: 'complete',
  submit_type: null,
  subscription: null,
  success_url: 'http://localhost:3000/payment/success-payment-handler?session_id={CHECKOUT_SESSION_ID}',
  total_details: { amount_discount: 0, amount_shipping: 0, amount_tax: 0 },
  ui_mode: 'hosted',
  url: null
}



*/
import { Controller, Get, Req, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(
    private paymentService : PaymentService
  ) {}

  @Get('create-checkout')
  createCheckout() {
    return this.paymentService.createCheckout();
  }

  @Get('success-payment-handler')
  successPaymentHandler(@Req() req : Request, @Res() res : Response) {
    return this.paymentService.successPaymentHandler(req, res);
  }
}


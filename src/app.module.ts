import { Module } from '@nestjs/common';
import { PaymentModule } from './payment/payment.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [PaymentModule, EmailModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

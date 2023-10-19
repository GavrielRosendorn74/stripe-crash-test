import { Injectable } from '@nestjs/common';
import * as FormData from 'form-data';
import Mailgun from 'mailgun.js';

@Injectable()
export class EmailService {
  private mailgun : Mailgun = new Mailgun(FormData);
  private mailgunClient = this.mailgun.client({
    username: 'api', 
    key: 'YOUR_KEY'
  });

  async send(
    toEmail : string,
    subject: string,
    content : string
  ) {
    const message =  await this.mailgunClient.messages.create('sandboxcbafe1e1a36c40bfa59b5f0126872eda.mailgun.org', {
      from: "Avoine Shop <avoine-shop@sandboxcbafe1e1a36c40bfa59b5f0126872eda.mailgun.org>",
      to: [ toEmail ],
      subject: subject,
      text: content
    });
  }
}

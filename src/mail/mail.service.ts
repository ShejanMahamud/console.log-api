import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class MailService {
  constructor(
    //inject mailer service
    @InjectQueue('mailer') private mailQueue: Queue,
  ) {}

  //send account verify email
  public async sendAccountVerifyEmail(data: {
    to: string;
    userName: string;
    verificationLink: string;
    year: number;
  }) {
    await this.mailQueue.add('account-verify-email', data);
  }

  //send password reset email
  public async passwordResetEmail(data: {
    to: string;
    name: string;
    resetUrl: string;
  }) {
    await this.mailQueue.add('reset-password-email', data);
  }
}

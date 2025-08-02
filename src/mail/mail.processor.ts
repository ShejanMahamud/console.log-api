import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { NotFoundException } from '@nestjs/common';
import { Job } from 'bullmq';

export type VerificationMailData = {
  type: 'verification';
  to: string;
  userName: string;
  verificationLink: string;
  year: number;
};

export type PasswordResetMailData = {
  type: 'password_reset';
  to: string;
  name: string;
  resetUrl: string;
};

export type MailJobData = VerificationMailData | PasswordResetMailData;

// Define job types with their corresponding data
export type MailJob =
  | Job<VerificationMailData, any, 'account-verify-email'>
  | Job<PasswordResetMailData, any, 'reset-password-email'>;

//define processor and set concurrency(can send 10 email at a time) at 10
@Processor('mailer', { concurrency: 10 })
export class MailProcessor extends WorkerHost {
  constructor(private mailerService: MailerService) {
    super();
  }
  //use process for job process
  async process(job: MailJob): Promise<any> {
    switch (job.name) {
      case 'account-verify-email': {
        if (job.data.type !== 'verification') {
          throw new Error('Invalid data type for verification email');
        }
        return this.mailerService.sendMail({
          to: job.data.to,
          subject: 'Verify Your Email!',
          template: 'account-verify.hbs',
          context: {
            userName: job.data.userName,
            verificationLink: job.data.verificationLink,
            year: job.data.year,
          },
        });
      }

      case 'reset-password-email': {
        if (job.data.type !== 'password_reset') {
          throw new Error('Invalid data type for password reset email');
        }
        return this.mailerService.sendMail({
          to: job.data.to,
          subject: 'Password Reset Request!',
          template: 'password-reset.hbs',
          context: {
            userName: job.data.name,
            verificationLink: job.data.resetUrl,
          },
        });
      }
      //throw error if not match job
      default:
        throw new NotFoundException(`Email job type not found`);
    }
  }
}

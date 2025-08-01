import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadProcessor } from './upload.processor';
import { UploadService } from './upload.service';

@Module({
  imports: [],
  providers: [
    UploadService,
    UploadProcessor,
    {
      provide: 'AWS_S3',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new S3Client({
          region: config.get<string>('AWS_REGION') as string,
          credentials: {
            accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID') as string,
            secretAccessKey: config.get<string>(
              'AWS_SECRET_ACCESS_KEY',
            ) as string,
          },
        });
      },
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}

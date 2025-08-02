import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, RequestTimeoutException } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('uploader')
export class UploadProcessor extends WorkerHost {
  constructor(
    //inject aws service
    @Inject('AWS_S3') private readonly s3: S3Client,
  ) {
    super();
  }

  async process(
    job: Job<{
      buffer: string;
      mimeType: string;
      bucketName: string;
      key: string;
    }>,
  ): Promise<string> {
    const { data } = job;
    //upload to s3
    try {
      const command = new PutObjectCommand({
        Bucket: data.bucketName,
        Key: data.key,
        Body: Buffer.from(data.buffer, 'base64'),
        ContentType: data.mimeType,
      });
      await this.s3.send(command);
      return data.key;
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
  }
}

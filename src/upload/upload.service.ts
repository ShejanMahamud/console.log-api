import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Inject,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { Util } from 'src/utils/util';

@Injectable()
export class UploadService {
  private readonly bucketName: string;
  private readonly cloudfrontUrl: string;

  constructor(
    //inject aws service
    @Inject('AWS_S3') private readonly s3: S3Client,
    //inject config service
    private readonly config: ConfigService,
  ) {
    //bucket name
    this.bucketName = this.config.get<string>('AWS_PUBLIC_BUCKET') as string;
    //cloudfront url
    this.cloudfrontUrl = this.config.get<string>(
      'AWS_CLOUDFRONT_URL',
    ) as string;
  }

  //generate unique filenames
  private generateFileName(fileName: string): string {
    const uuid = Util.genToken(16);
    const ext = path.extname(fileName);
    return `${Date.now()}-${uuid}${ext}`;
  }

  //file uploader method
  private async uploadToS3(file: Express.Multer.File) {
    //check mime type
    if (
      !['image/gif', 'image/jpg', 'image/jpeg', 'image/png'].includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException('Mime type not supported');
    }
    //generate key
    const key = this.generateFileName(file.originalname);
    //upload to s3
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });
      await this.s3.send(command);
      return key;
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
  }

  //get cloudfront url
  public async uploadAndGetUrl(file: Express.Multer.File): Promise<string> {
    const fileName = await this.uploadToS3(file);
    return `${this.cloudfrontUrl}/${fileName}`;
  }
}

import { Module } from '@nestjs/common';
import { UploadModule } from 'src/upload/upload.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UploadModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

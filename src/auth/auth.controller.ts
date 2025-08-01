import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    //inject auth service
    private readonly authService: AuthService,
  ) {}

  //file upload interceptor
  @UseInterceptors(FileInterceptor('profilePicture'))
  //register route
  @Post('register')
  public register(
    @Body() data: RegisterUserDto,
    @UploadedFile() profilePicture: Express.Multer.File,
  ) {
    return this.authService.registerUser(data, profilePicture);
  }
}

import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/create-user.dto';
import { GithubLoginDto } from './dto/github-login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

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

  //google login route
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  //google login callback route
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request) {
    return this.authService.googleLogin(req.user as GoogleLoginDto);
  }

  //github login route
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  //github login callback route
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: Request) {
    return this.authService.githubLogin(req.user as GithubLoginDto);
  }
}

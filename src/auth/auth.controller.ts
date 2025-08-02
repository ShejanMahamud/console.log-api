import {
  Body,
  Controller,
  Get,
  Param,
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
import { AccountVerifyDto } from './dto/account-verify.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterUserDto } from './dto/create-user.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { GithubLoginDto } from './dto/github-login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login-user.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
    @Req() req: Request,
  ) {
    return this.authService.registerUser(data, profilePicture, req);
  }

  //login route
  @Post('login')
  public async login(data: LoginDto) {
    return this.authService.loginUser(data);
  }

  //google login route
  @Get('google')
  @UseGuards(AuthGuard('google'))
  public async googleAuth() {}

  //google login callback route
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  public async googleAuthCallback(@Req() req: Request) {
    return this.authService.googleLogin(req.user as GoogleLoginDto);
  }

  //github login route
  @Get('github')
  @UseGuards(AuthGuard('github'))
  public async githubAuth() {}

  //github login callback route
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  public async githubAuthCallback(@Req() req: Request) {
    return this.authService.githubLogin(req.user as GithubLoginDto);
  }

  //regenerate tokens if valid token in db
  @Post('refresh')
  @UseGuards(AuthGuard('refresh'))
  public async generateNewTokens(data: RefreshTokenDto) {
    return this.authService.refreshToken(data);
  }

  //validate account verify email
  @Post('validate-account')
  public async validateAccount(data: AccountVerifyDto) {
    return this.authService.validateAccountVerifyEmail(data);
  }

  //resend account verify email
  @Post('resend-verify')
  public async resendAccountVerify(
    @Param() email: string,
    @Req() req: Request,
  ) {
    return this.authService.resendAccountVerification(email, req);
  }

  //forget password reset email
  @Post('forget-password')
  public async forgetPassword(data: ForgetPasswordDto, @Req() req: Request) {
    return this.authService.forgetPassword(data, req);
  }

  //reset password
  @Post('reset-password')
  public async resetPassword(data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }

  //change password
  @Post('change-password')
  @UseGuards(AuthGuard('access'))
  public async changePassword(data: ChangePasswordDto) {
    return this.authService.changePassword(data);
  }

  //logout route
  @Post('logout')
  @UseGuards(AuthGuard('access'))
  public async logOut(data: LogoutDto) {
    return this.authService.logOut(data);
  }
}

import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('profilePicture'))
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({ summary: 'Register a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many registration attempts',
  })
  public async register(
    @Body() data: RegisterUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    profilePicture: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.authService.registerUser(data, profilePicture, req);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many login attempts',
  })
  public async login(@Body() data: LoginDto) {
    return this.authService.loginUser(data);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google OAuth',
  })
  public async googleAuth() {
    // This method initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Google login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Google authentication failed',
  })
  public async googleAuthCallback(@Req() req: Request) {
    return this.authService.googleLogin(req.user as GoogleLoginDto);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Initiate GitHub OAuth login' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to GitHub OAuth',
  })
  public async githubAuth() {
    // This method initiates GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'GitHub login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'GitHub authentication failed',
  })
  public async githubAuthCallback(@Req() req: Request) {
    return this.authService.githubLogin(req.user as GithubLoginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('refresh'))
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many refresh attempts',
  })
  public async generateNewTokens(@Body() data: RefreshTokenDto) {
    return this.authService.refreshToken(data);
  }

  @Post('validate-account')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Validate account verification' })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid verification token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many verification attempts',
  })
  public async validateAccount(@Body() data: AccountVerifyDto) {
    return this.authService.validateAccountVerifyEmail(data);
  }

  @Post('resend-verify/:email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  @ApiOperation({ summary: 'Resend account verification email' })
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email address',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many resend attempts',
  })
  public async resendAccountVerify(
    @Param('email') email: string,
    @Req() req: Request,
  ) {
    return this.authService.resendAccountVerification(email, req);
  }

  @Post('forget-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email address',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many password reset attempts',
  })
  public async forgetPassword(
    @Body() data: ForgetPasswordDto,
    @Req() req: Request,
  ) {
    return this.authService.forgetPassword(data, req);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 requests per 5 minutes
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid reset token or password',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many reset attempts',
  })
  public async resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('access'))
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 requests per 5 minutes
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid current password or new password',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many password change attempts',
  })
  public async changePassword(@Body() data: ChangePasswordDto) {
    return this.authService.changePassword(data);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('access'))
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
  public async logOut(@Body() data: LogoutDto) {
    return this.authService.logOut(data);
  }
}

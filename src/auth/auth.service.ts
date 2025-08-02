import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import { Util } from 'src/utils/util';
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
import { UpdateUserDto } from './dto/update-user.dto';
import { IJwtPayload } from './types';

@Injectable()
export class AuthService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(
    //inject prisma service
    private readonly prisma: PrismaService,

    //inject config service
    private readonly config: ConfigService,

    //inject upload service
    private readonly upload: UploadService,

    //inject jwt service
    private readonly jwt: JwtService,

    //inject mail service
    private readonly mail: MailService,
  ) {
    //access token secret
    this.accessTokenSecret = config.get<string>(
      'ACCESS_TOKEN_SECRET',
    ) as string;
    //refresh token secret
    this.refreshTokenSecret = config.get<string>(
      'REFRESH_TOKEN_SECRET',
    ) as string;
    //access token expires
    this.accessTokenExpiresIn = config.get<string>(
      'ACCESS_TOKEN_EXPIRES',
    ) as string;
    //refresh token expires
    this.refreshTokenExpiresIn = config.get<string>(
      'REFRESH_TOKEN_EXPIRES',
    ) as string;
  }

  //check if user exist
  private async isUserExists(identifiers: {
    id?: string;
    email?: string;
    username?: string;
  }): Promise<boolean> {
    const { id, email, username } = identifiers;
    if (!id && !email && !username) {
      throw new BadRequestException(
        'At least one of id, email, or username is required.',
      );
    }
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(id ? [{ id }] : []),
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : []),
        ],
      },
    });

    return !!user;
  }

  //check is date expire or not
  private isExpired(date: Date) {
    return new Date() > date;
  }

  //check if hashed and text are matched or not
  private async isMatched(
    hashed: string,
    text: string | Buffer,
  ): Promise<boolean> {
    return await Util.match(text, hashed);
  }

  //register a user
  public async registerUser(
    data: RegisterUserDto,
    file: Express.Multer.File,
    req: Request,
  ) {
    //verify token gen
    const verifyToken = Util.genToken();
    //gen verify token exp
    const verifyTokenExp = new Date(Date.now() + 1000 * 60 + 15);
    //upload image to queue
    const profilePicture = await this.upload.uploadAndGetUrl(file);
    //check if user exists
    const isExist = await this.isUserExists({ email: data.email });

    if (isExist) {
      return new BadRequestException('User already exists');
    }
    //hash verify token
    const hashedToken = await Util.hash(verifyToken);
    //if not exists then create user
    const user = await this.prisma.user.create({
      data: {
        ...data,
        profilePicture,
        verifyToken: hashedToken,
        verifyTokenExp,
      },
    });
    //if user created send account verification email
    if (user) {
      await this.mail.sendAccountVerifyEmail({
        to: user.email,
        userName: user.username,
        verificationLink: `${req.protocol}://${req.get('host')}/token=${verifyToken}&uid=${user.id}`,
        year: new Date().getFullYear(),
      });
    }
    //return data
    return {
      success: true,
      message: 'Register Successful!',
    };
  }

  //validate account verify email and update status
  public async validateAccountVerifyEmail(data: AccountVerifyDto) {
    //find unique user
    const isUserExist = await this.prisma.user.findUnique({
      where: {
        id: data.uid,
      },
      select: {
        id: true,
        verifyToken: true,
        verifyTokenExp: true,
      },
    });
    //check if user, user's verify token, user's verify token exp is available or not
    if (
      !isUserExist ||
      !isUserExist.verifyToken ||
      !isUserExist.verifyTokenExp
    ) {
      throw new NotFoundException('User not exist');
    }
    //check if matched or not
    const isMatched = await this.isMatched(
      isUserExist.verifyToken,
      data.verifyToken,
    );
    if (!isMatched) {
      throw new BadRequestException('Tokens are not matched');
    }
    //check expired or not
    const isExpired = this.isExpired(isUserExist.verifyTokenExp);
    if (isExpired) {
      throw new BadRequestException('Token is expired');
    }
    //update status
    await this.updateUser(
      {
        verifyToken: null,
        verifyTokenExp: null,
        emailVerified: true,
      },
      isUserExist.id,
    );
    return { success: true, message: 'Account email verified' };
  }

  //get access token after expire via refresh token
  async refreshToken(data: RefreshTokenDto) {
    //find unique user
    const user = await this.prisma.user.findUnique({
      where: {
        id: data.id,
        isDeleted: false,
        emailVerified: true,
      },
      select: {
        refreshToken: true,
        refreshTokenExp: true,
        email: true,
        id: true,
      },
    });
    //check if user, user's refresh token, user's refresh token exp is available or not
    if (!user || !user.refreshToken || !user.refreshTokenExp) {
      throw new NotFoundException('User or refresh token not found');
    }
    //is refresh tokens are matched
    const isMatched = await this.isMatched(user.refreshToken, data.token);
    //is token is expired
    const isExpired = this.isExpired(user.refreshTokenExp);
    //if expired or not matched throw error
    if (!isMatched || isExpired) {
      throw new BadRequestException('Tokens are not matched or expired');
    }
    //verify with jwt the token
    await this.jwt.verify(data.token, {
      secret: this.refreshTokenSecret,
    });
    //revoke new token and save in db
    const tokens = await this.saveTokenInDb(user.id, user.email);
    return {
      success: true,
      message: 'New tokens revoked!',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }
  //resend verify email
  public async resendAccountVerification(email: string, req: Request) {
    //find unique
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
        emailVerified: false,
        isDeleted: false,
      },
      select: {
        verifyToken: true,
        verifyTokenExp: true,
        id: true,
        email: true,
        username: true,
      },
    });
    //check if user, user's verify token, user's verify token exp is available or not

    if (!user || !user.verifyToken || !user.verifyTokenExp) {
      throw new NotFoundException('User not found or already verified');
    }
    //check if expired
    const isExpired = this.isExpired(user.verifyTokenExp);
    if (!isExpired) {
      throw new BadRequestException(
        'Token is valid right now. no need to request new',
      );
    }
    const verifyToken = await Util.hash(Util.genToken());
    const verifyTokenExp = new Date(Date.now() + 1000 * 60 * 15);
    //update the new token and send email
    await this.updateUser(
      {
        verifyToken,
        verifyTokenExp,
      },
      user.id,
    );
    await this.mail.sendAccountVerifyEmail({
      to: user.email,
      userName: user.username,
      verificationLink: `${req.protocol}://${req.get('host')}/token=${verifyToken}/uid=${user.id}`,
      year: new Date().getFullYear(),
    });
    return {
      success: true,
      message: 'Verification email sent!',
    };
  }

  //save refresh token in db
  private async saveTokenInDb(
    userId: string,
    email: string,
    provider?: 'email' | 'github' | 'google',
  ) {
    //generate tokens
    const tokens = await this.generateTokens({
      email: email,
      sub: userId,
    });
    //hash refresh token
    const hashedToken = await Util.hash(tokens.refreshToken);
    //save hashed refresh token in db
    await this.updateUser(
      {
        refreshToken: hashedToken,
        refreshTokenExp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        ...(provider && { provider: provider }),
      },
      userId,
    );
    return tokens;
  }

  //login a user
  public async loginUser(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
        emailVerified: true,
        isDeleted: false,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found for this email!');
    }
    //if login provider is email then check user has password or not
    if (user.provider === 'email') {
      if (!user.password) {
        throw new BadRequestException(
          'Password not set for this user. use social login',
        );
      }
      //check if password or not
      const isMatched = await this.isMatched(user.password, data.password);

      if (!isMatched) {
        throw new BadRequestException('Credentials are not matched');
      }
    }
    //save and get tokens
    const tokens = await this.saveTokenInDb(user.id, user.email, 'email');
    //return data
    return {
      success: true,
      message: 'Logged in successfully!',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  public async googleLogin(data: GoogleLoginDto) {
    //check if user exists
    let user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    //if not create a user
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          ...data,
          provider: 'google',
        },
      });
    }
    //set and get tokens
    const tokens = await this.saveTokenInDb(user.id, user.email, 'email');
    //return data
    return {
      success: true,
      message: 'Google login successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  //github login
  public async githubLogin(data: GithubLoginDto) {
    //find if user exists
    let user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    //if not then create a user
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          ...data,
          provider: 'github',
        },
      });
    }
    //set and get tokens
    const tokens = await this.saveTokenInDb(user.id, user.email, 'email');
    //send response to client
    return {
      success: true,
      message: 'Github login successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  //generate access & refresh token
  private async generateTokens(data: IJwtPayload) {
    //generating both token using jwt
    const [accessToken, refreshToken] = await Promise.all([
      //access token
      this.jwt.sign(data, {
        secret: this.accessTokenSecret,
        expiresIn: this.accessTokenExpiresIn,
      }),
      //refresh token
      this.jwt.sign(data, {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpiresIn,
      }),
    ]);
    //return both
    return { accessToken, refreshToken };
  }

  //forget password
  public async forgetPassword(data: ForgetPasswordDto, req: Request) {
    //check is user available
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        resetToken: true,
        resetTokenExp: true,
      },
    });
    //check is user already has reset token as well as expired or not
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    if (
      user.resetToken &&
      user.resetTokenExp &&
      !this.isExpired(user.resetTokenExp)
    ) {
      throw new BadRequestException(
        'A reset email was already sent. Please wait before requesting again.',
      );
    }
    //added reset token to db
    const resetToken = Util.genToken();
    const resetTokenExp = new Date(Date.now() + 1000 * 60 * 15);
    const hashed = await Util.hash(resetToken);
    await this.updateUser(
      {
        resetToken: hashed,
        resetTokenExp,
      },
      user.id,
    );
    //send forget password email
    await this.mail.passwordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl: `${req.protocol}://${req.get('host')}/token=${resetToken}/uid=${user.id}`,
    });

    return { success: true, message: 'Password reset email sent' };
  }

  //change password
  public async changePassword(data: ChangePasswordDto) {
    //find the user
    const user = await this.prisma.user.findUnique({
      where: {
        id: data.uid,
        emailVerified: true,
        isDeleted: false,
        provider: 'email',
      },
    });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    //match old password
    if (!user.password) {
      throw new BadRequestException('User has no password. Use social login');
    }
    const isMatched = await this.isMatched(user.password, data.oldPassword);
    if (!isMatched) {
      throw new BadRequestException('Old password is not matched!');
    }
    //hash new password
    const hashed = await Util.hash(data.newPassword);
    //update password
    await this.updateUser(
      {
        password: hashed,
      },
      user.id,
    );
    return { success: true, message: 'Password changed successfully' };
  }

  //reset password
  public async resetPassword(data: ResetPasswordDto) {
    //find unique user
    const user = await this.prisma.user.findUnique({
      where: {
        id: data.uid,
        emailVerified: true,
        isDeleted: false,
      },
      select: {
        resetToken: true,
        resetTokenExp: true,
        id: true,
      },
    });
    //check if user, user's reset token, user's reset token exp is available or not

    if (!user || !user.resetToken || !user.resetTokenExp) {
      throw new UnauthorizedException('User not found!');
    }
    //check is matched with req data
    const isMatched = await this.isMatched(user.resetToken, data.token);
    if (!isMatched)
      throw new UnauthorizedException('Reset Token is not valid!');
    //check is token expired
    const isExpired = this.isExpired(user.resetTokenExp);
    if (!isExpired) throw new ForbiddenException('Reset token is expired');

    //hash the new password
    const hashed = await Util.hash(data.newPassword);
    //update password
    await this.updateUser(
      {
        resetToken: null,
        resetTokenExp: null,
        password: hashed,
      },
      user.id,
    );
    return { success: true, message: 'Password successfully reset' };
  }

  //update user route
  public async updateUser(data: Partial<UpdateUserDto>, id: string) {
    //check user exists or not
    const user = await this.isUserExists({ id });
    //if not then throw an exception
    if (!user) {
      throw new NotFoundException('User not found');
    }
    //update the user
    const updatedUser = await this.prisma.user.update({
      where: {
        id,
        isDeleted: false,
      },
      data: {
        ...data,
      },
    });
    //return data
    return {
      success: true,
      message: 'User updated successfully!',
      data: updatedUser,
    };
  }

  public async logOut(data: LogoutDto) {
    const user = await this.isUserExists({ id: data.id });
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    await this.updateUser(
      {
        refreshToken: null,
        refreshTokenExp: null,
        resetToken: null,
        resetTokenExp: null,
        verifyToken: null,
        verifyTokenExp: null,
      },
      data.id,
    );
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import { Util } from 'src/utils/util';
import { RegisterUserDto } from './dto/create-user.dto';
import { GithubLoginDto } from './dto/github-login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login-user.dto';
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
  public async registerUser(data: RegisterUserDto, file: Express.Multer.File) {
    const verifyToken = Util.genToken();
    const verifyTokenExp = new Date(Date.now() + 1000 * 60 + 15);
    const profilePicture = await this.upload.uploadAndGetUrl(file);
    const isExist = await this.isUserExists({ email: data.email });

    if (isExist) {
      return new BadRequestException('User already exists');
    }
    await this.prisma.user.create({
      data: {
        ...data,
        profilePicture,
        verifyToken,
        verifyTokenExp,
      },
    });
    return {
      success: true,
      message: 'Register Successful!',
    };
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
    if (user.provider === 'email') {
      if (!user.password) {
        throw new BadRequestException(
          'Password not set for this user. use social login',
        );
      }

      const isMatched = await this.isMatched(user.password, data.password);
      if (!isMatched) {
        throw new BadRequestException('Credentials are not matched');
      }
    }

    const tokens = await this.generateTokens({
      email: user.email,
      sub: user.id,
    });
    const hashedToken = await Util.hash(tokens.refreshToken);
    await this.updateUser(
      {
        refreshToken: hashedToken,
        refreshTokenExp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        provider: 'email',
      },
      user.id,
    );
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
    let user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          ...data,
          provider: 'google',
        },
      });
    }
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
    });
    const hashedToken = await Util.hash(tokens.refreshToken);
    await this.updateUser(
      {
        refreshToken: hashedToken,
        refreshTokenExp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
      user.id,
    );
    return {
      success: true,
      message: 'Google login successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  public async githubLogin(data: GithubLoginDto) {
    let user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          ...data,
          provider: 'github',
        },
      });
    }
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
    });
    const hashedToken = await Util.hash(tokens.refreshToken);
    await this.updateUser(
      {
        refreshToken: hashedToken,
        refreshTokenExp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
      user.id,
    );
    return {
      success: true,
      message: 'Github login successful',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  private async generateTokens(data: IJwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.sign(data, {
        secret: this.accessTokenSecret,
        expiresIn: this.accessTokenExpiresIn,
      }),
      this.jwt.sign(data, {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpiresIn,
      }),
    ]);
    return { accessToken, refreshToken };
  }

  public async updateUser(data: Partial<UpdateUserDto>, id: string) {
    const user = await this.isUserExists({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updatedUser = await this.prisma.user.update({
      where: {
        id,
        isDeleted: false,
      },
      data: {
        ...data,
      },
    });
    return {
      success: true,
      message: 'User updated successfully!',
      data: updatedUser,
    };
  }
}

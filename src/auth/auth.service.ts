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
    //if not exists then create user
    await this.prisma.user.create({
      data: {
        ...data,
        profilePicture,
        verifyToken,
        verifyTokenExp,
      },
    });
    //return data
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
    //generate tokens
    const tokens = await this.generateTokens({
      email: user.email,
      sub: user.id,
    });
    //hash refresh token
    const hashedToken = await Util.hash(tokens.refreshToken);
    //save hashed refresh token in db
    await this.updateUser(
      {
        refreshToken: hashedToken,
        refreshTokenExp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        provider: 'email',
      },
      user.id,
    );
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
    //generate tokens
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
    });
    //hash refresh token in db
    const hashedToken = await Util.hash(tokens.refreshToken);
    //save hashed refresh token in db
    await this.updateUser(
      {
        refreshToken: hashedToken,
        refreshTokenExp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
      user.id,
    );
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
    //generate two tokens
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
    });
    //hash the refresh token
    const hashedToken = await Util.hash(tokens.refreshToken);
    //save the refresh token with 7d expiration
    await this.updateUser(
      {
        refreshToken: hashedToken,
        refreshTokenExp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
      user.id,
    );
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
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import { Util } from 'src/utils/util';
import { RegisterUserDto } from './dto/create-user.dto';

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
      'ACCESS_TOKEN_EXPIRES_IN',
    ) as string;
    //refresh token expires
    this.refreshTokenExpiresIn = config.get<string>(
      'REFRESH_TOKEN_EXPIRES_IN',
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
}

import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from 'generated/prisma';
import { RegisterUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(RegisterUserDto) {
  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;

  @IsString()
  @IsOptional()
  refreshToken: string | null;

  @IsDate()
  @IsOptional()
  refreshTokenExp: Date | null;

  @IsString()
  @IsOptional()
  verifyToken: string | null;

  @IsDate()
  @IsOptional()
  verifyTokenExp: Date | null;

  @IsString()
  @IsOptional()
  resetToken: string | null;

  @IsDate()
  @IsOptional()
  resetTokenExp: Date | null;

  @IsBoolean()
  @IsOptional()
  isDeleted: boolean;
  @IsBoolean()
  @IsOptional()
  emailVerified: boolean;
}

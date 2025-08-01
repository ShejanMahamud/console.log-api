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
  refreshToken: string;

  @IsDate()
  @IsOptional()
  refreshTokenExp: Date;

  @IsString()
  @IsOptional()
  verifyToken: string;

  @IsDate()
  @IsOptional()
  verifyTokenExp: Date;

  @IsString()
  @IsOptional()
  resetToken: string;

  @IsDate()
  @IsOptional()
  resetTokenExp: Date;

  @IsBoolean()
  @IsOptional()
  isDeleted: boolean;
}

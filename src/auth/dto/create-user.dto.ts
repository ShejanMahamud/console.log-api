import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Provider } from 'generated/prisma';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ValidateIf((o: RegisterUserDto) => o.provider === 'email')
  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password minimum 8 characters long',
  })
  readonly password: string;

  provider: Provider;
}

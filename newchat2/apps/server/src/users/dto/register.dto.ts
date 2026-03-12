import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  displayName: string;
}

import {
  IsNotEmpty,
  Min,
  IsNumber,
  IsOptional,
  IsEmail,
  IsStrongPassword,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  userName: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password too weak. Must include uppercase, lowercase, number, symbol, and be at least 8 characters.',
    },
  )
  password: string;
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  roleId: number;
  @IsOptional()
  @IsNumber()
  @Min(1)
  parentId: number;
}

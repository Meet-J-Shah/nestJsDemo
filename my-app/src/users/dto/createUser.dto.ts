import {
  IsNotEmpty,
  MinLength,
  Min,
  IsNumber,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  userName: string;
  @IsEmail()
  email: string;
  @MinLength(6)
  password: string;
  @IsNumber()
  @Min(1)
  roleId: number;
  @IsOptional()
  @IsNumber()
  @Min(1)
  parentId: number;
}

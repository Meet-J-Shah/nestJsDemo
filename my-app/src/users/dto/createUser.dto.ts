import {
  IsNotEmpty,
  MinLength,
  Min,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;
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

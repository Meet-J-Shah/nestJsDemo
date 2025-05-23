/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNotEmpty, MinLength, Min, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;
  @MinLength(6)
  password: string;
  @IsNumber()
  @Min(1)
  roleId: number;
}

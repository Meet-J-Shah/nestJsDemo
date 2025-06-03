import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(25)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(25)
  display_name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

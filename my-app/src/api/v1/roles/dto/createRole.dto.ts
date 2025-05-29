import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  parentId: number;
}

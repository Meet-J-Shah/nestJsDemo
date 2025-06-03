import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreateRolePermissionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roleId: number;
  @Type(() => Number)
  @IsInt()
  @Min(1)
  permissionId: number;
}

import { IsNumber, Min } from 'class-validator';

export class CreateRolePermissionDto {
  @IsNumber()
  @Min(2)
  roleId: number;
  @IsNumber()
  @Min(1)
  permissionId: number;
}

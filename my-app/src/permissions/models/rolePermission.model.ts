import { Model, Column, Table, ForeignKey } from 'sequelize-typescript';
import { Role } from '../../roles/models/role.model';
import { Permission } from './permission.model';

@Table({
  tableName: 'role_permissions',
  timestamps: false, // Usually join tables don't need timestamps, add if you want
})
export class RolePermission extends Model<RolePermission> {
  @ForeignKey(() => Role)
  @Column({
    type: 'INTEGER',
    allowNull: false,
    field: 'role_id', // snake_case column name
  })
  roleId: number;

  @ForeignKey(() => Permission)
  @Column({
    type: 'INTEGER',
    allowNull: false,
    field: 'permission_id', // snake_case column name
  })
  permissionId: number;
}

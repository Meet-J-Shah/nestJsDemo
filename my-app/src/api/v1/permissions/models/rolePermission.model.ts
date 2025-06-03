import {
  Model,
  Column,
  Table,
  ForeignKey,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { Role } from '../../roles/models/role.model';
import { Permission } from './permission.model';

export interface RolePermissionCreationAttrs {
  roleId: number;
  permissionId: number;
}

@Table({
  tableName: 'role_permissions',
  timestamps: false, // Optional, depending on your use case
})
export class RolePermission extends Model<RolePermission> {
  @ForeignKey(() => Role)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'role_id', // maps property to DB column
  })
  roleId!: number;

  @ForeignKey(() => Permission)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'permission_id', // maps property to DB column
  })
  permissionId!: number;

  @BelongsTo(() => Role)
  role!: Role;

  @BelongsTo(() => Permission)
  permission!: Permission;
}

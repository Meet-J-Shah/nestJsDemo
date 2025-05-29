import {
  Model,
  Column,
  Table,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { Role } from '../../roles/models/role.model';
import { Permission } from './permission.model';

@Table({
  tableName: 'role_permissions',
  paranoid: true,
  timestamps: true, // Usually join tables don't need timestamps, add if you want
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

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @DeletedAt
  @Column({ field: 'deleted_at' })
  declare deletedAt: Date;
}

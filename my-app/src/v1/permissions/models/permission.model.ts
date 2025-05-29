// permission.model.ts
import { Table, Column, Model, BelongsToMany } from 'sequelize-typescript';
import { Role } from '../../roles/models/role.model';
import { RolePermission } from './rolePermission.model';

@Table({
  tableName: 'permissions',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Permission extends Model<Permission> {
  @Column
  name: string;

  @BelongsToMany(() => Role, () => RolePermission)
  roles: Role[];
}

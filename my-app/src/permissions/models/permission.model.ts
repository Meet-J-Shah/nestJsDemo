// permission.model.ts
import { Table, Column, Model, BelongsToMany } from 'sequelize-typescript';
import { Role } from './role.model';
import { RolePermission } from './role-permission.model';

@Table({ tableName: 'permissions', timestamps: true, paranoid: true })
export class Permission extends Model<Permission> {
  @Column
  name: string;

  @BelongsToMany(() => Role, () => RolePermission)
  roles: Role[];
}

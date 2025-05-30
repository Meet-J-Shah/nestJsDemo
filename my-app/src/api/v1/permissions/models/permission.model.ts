// permission.model.ts
import {
  Table,
  Column,
  Model,
  BelongsToMany,
  DataType,
} from 'sequelize-typescript';
import { Role } from '../../roles/models/role.model';
// import { RolePermission } from './rolePermission.model';

@Table({
  tableName: 'permissions',
  timestamps: true,
  // paranoid: true,
  underscored: true,
})
export class Permission extends Model<Permission> {
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;
  @Column({ type: DataType.STRING, allowNull: false })
  display_name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;
  // @BelongsToMany(() => Role, () => RolePermission)
  // roles: Role[];
  @BelongsToMany(() => Role, {
    through: 'role_permissions', // Join table name
    foreignKey: 'permission_id',
    otherKey: 'role_id',
    timestamps: false,
  })
  roles: Role[];
}

import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  BelongsToMany,
  BeforeDestroy,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { Permission } from 'src/api/v1/permissions/models/permission.model';
import { RolePermission } from 'src/api/v1/permissions/models/rolePermission.model';
import { BelongsToManyAddAssociationsMixin, DestroyOptions } from 'sequelize';

@Table({
  timestamps: true, // enable createdAt and updatedAt
  paranoid: true, // enable deletedAt (soft delete)
  underscored: true, // use snake_case column names
})
export class Role extends Model<Role> {
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  name: string;

  // @Column({ type: DataType.INTEGER, allowNull: false })
  // level: number;

  // Creator of the role
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  creatorId: number | null;

  @BelongsTo(() => User, 'creatorId')
  creator: User;
  //  Parent User
  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER, allowNull: true })
  parentId: number | null;

  @BelongsTo(() => Role, 'parentId')
  parent: Role;

  //  Children
  @HasMany(() => Role, 'parentId')
  children: Role[];

  @BelongsToMany(() => Permission, {
    // through: 'role_permissions',
    through: () => RolePermission,
    foreignKey: 'role_id',
    otherKey: 'permission_id',
    timestamps: false,
  })
  permissions: Permission[];
  public addPermissions!: BelongsToManyAddAssociationsMixin<Permission, number>;
  public addPermission!: BelongsToManyAddAssociationsMixin<Permission, number>; // optional if used

  /**
   * Hook to clean up role_permissions entries before Role soft-delete
   */
  @BeforeDestroy
  static async cleanRolePermissions(role: Role, options: DestroyOptions) {
    await Role.update(
      { parentId: null },
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: { parentId: role.id },
        transaction: options.transaction,
      },
    );
    await User.update(
      { roleId: null },
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        where: { roleId: role.id },
        transaction: options.transaction,
      },
    );
    // Delete role_permission entries related to this role (force true to hard delete)
    await RolePermission.destroy({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { roleId: role.id },
      force: true,
      transaction: options.transaction,
    });
  }
}

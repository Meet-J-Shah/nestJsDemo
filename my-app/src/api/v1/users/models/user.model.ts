import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  BeforeDestroy,
} from 'sequelize-typescript';
import { Role } from '../../roles/models/role.model';
import { DestroyOptions } from 'sequelize';
import { Book } from '../../books/models/book.model';

@Table({
  // timestamps: true, // enable createdAt and updatedAt
  underscored: true, // use snake_case column names
  paranoid: true,
})
export class User extends Model<User> {
  // [x: string]: any;
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  userName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({ type: DataType.STRING })
  password: string;

  //  Role (Each user has one role)
  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER, allowNull: true })
  roleId: number | null;

  @BelongsTo(() => Role)
  role: Role;

  //  Parent User
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  parentId: number | null;

  @BelongsTo(() => User, 'parentId')
  parent: User;

  //  Children
  @HasMany(() => User, 'parentId')
  children: User[];

  // Created Roles
  @HasMany(() => Role, 'creatorId')
  createdRoles: Role[];

  @BeforeDestroy
  static async cleanupOnDelete(
    user: User,
    options: DestroyOptions,
  ): Promise<void> {
    // Set parentId of child users to null
    await User.update(
      { parentId: null },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { where: { parentId: user.id }, transaction: options.transaction },
    );

    // Set creatorId of roles to null
    await Role.update(
      { creatorId: null },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { where: { creatorId: user.id }, transaction: options.transaction },
    );

    await Book.update(
      { authorId: null },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { where: { authorId: user.id }, transaction: options.transaction },
    );
  }
}

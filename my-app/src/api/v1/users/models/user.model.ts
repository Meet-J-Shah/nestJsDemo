import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Role } from '../../roles/models/role.model';

@Table
export class User extends Model<User> {
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
  @Column
  roleId: number;

  @BelongsTo(() => Role)
  role: Role;

  //  Parent User
  @ForeignKey(() => User)
  @Column
  parentId: number;

  @BelongsTo(() => User, 'parentId')
  parent: User;

  //  Children
  @HasMany(() => User, 'parentId')
  children: User[];

  // Created Roles
  @HasMany(() => Role, 'creatorId')
  createdRoles: Role[];
}

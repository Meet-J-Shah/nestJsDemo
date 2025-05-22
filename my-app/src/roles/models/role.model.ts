import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';

@Table
export class Role extends Model<Role> {
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  name: string;

  // @Column({ type: DataType.INTEGER, allowNull: false })
  // level: number;

  // Creator of the role
  @ForeignKey(() => User)
  @Column
  creatorId: number;

  @BelongsTo(() => User, 'creatorId')
  creator: User;
  //  Parent User
  @ForeignKey(() => Role)
  @Column
  parentId: number;

  @BelongsTo(() => Role, 'parentId')
  parent: Role;

  //  Children
  @HasMany(() => Role, 'parentId')
  children: Role[];
}

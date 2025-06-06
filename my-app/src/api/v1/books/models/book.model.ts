// src/user/user.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';

@Table({
  timestamps: true, // enable createdAt and updatedAt
  paranoid: true, // enable deletedAt (soft delete)
  underscored: true, // use snake_case column names
})
export class Book extends Model<Book> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  authorId: number | null;
}

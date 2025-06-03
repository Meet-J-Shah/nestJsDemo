// src/user/user.model.ts
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  timestamps: true, // enable createdAt and updatedAt
  paranoid: true, // enable deletedAt (soft delete)
  underscored: true, // use snake_case column names
})
export class Book extends Model<Book> {
  // @Column({
  //   type: DataType.INTEGER,
  //   autoIncrement: true,
  //   primaryKey: true,
  // })
  // id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;
}

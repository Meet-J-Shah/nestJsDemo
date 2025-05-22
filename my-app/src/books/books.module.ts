import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Book } from './models/book.model';
import { BooksController } from './books.controller';

@Module({
  imports: [SequelizeModule.forFeature([Book])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}

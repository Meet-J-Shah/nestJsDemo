import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';
import { Book } from './models/book.model';
import { CreationAttributes } from 'sequelize';
type BookCreationAttrs = CreationAttributes<Book>;
@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book)
    private readonly bookModel: typeof Book,
  ) {}

  async create(createBookDto: CreateBookDto) {
    const book = await this.bookModel.create(
      createBookDto as BookCreationAttrs,
    );
    const bk = await Book.findByPk(book.bookId);
    return bk;
  }

  async findAll() {
    const books = await this.bookModel.findAll();
    return books.map((book) => book.get({ plain: true }));
  }

  async findOne(id: number) {
    const book = await this.bookModel.findByPk(id);
    return book?.get({ plain: true }); // MUST convert Sequelize instance
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const book = await Book.findByPk(id, { paranoid: false });
    if (!book) {
      return 'Not Found Error';
    }

    await book.update(updateBookDto);
    return book;
  }
  async remove(id: number): Promise<void> {
    const book = await this.bookModel.findByPk(id);
    await book?.destroy();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
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

  async findAll(): Promise<Book[]> {
    return this.bookModel.findAll();
  }

  findOne(id: number): Promise<Book | null> {
    const book = this.bookModel.findOne({
      where: {
        bookId: id,
      },
    });
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const book = await Book.findByPk(id, { paranoid: false });
    if (!book) {
      return 'Not Found Error';
    }
    // Update the tax data

    await book.update(updateBookDto);
    return book;
  }
  async remove(id: number): Promise<void> {
    const book = await this.bookModel.findByPk(id);
    await book?.destroy();
  }
}

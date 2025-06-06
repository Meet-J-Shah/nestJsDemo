import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateBookDto } from './dto/createBook.dto';
import { UpdateBookDto } from './dto/updateBook.dto';
import { Book } from './models/book.model';
import { reqUser } from '../../../common/interfaces/reqUser.interface';
import { CreationAttributes, Op } from 'sequelize';
import { User } from '../users/models/user.model';
type BookCreationAttrs = CreationAttributes<Book>;
@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book)
    private readonly bookModel: typeof Book,
  ) {}

  async create(reqUser: reqUser, createBookDto: CreateBookDto) {
    if (reqUser.roleId != 1 && createBookDto.authorId) {
      throw new ForbiddenException('book.error.notAuthorChange');
    }
    const ifExist = await Book.findOne({ where: { name: createBookDto.name } });
    if (ifExist) {
      throw new BadRequestException('book.error.exists');
    }
    if (createBookDto.authorId) {
      const author = await User.findByPk(createBookDto.authorId);
      if (!author) throw new NotFoundException('book.error.notFoundAuthor');
    }
    const book = await this.bookModel.create({
      name: createBookDto.name,
      authorId: createBookDto.authorId || reqUser.userId,
    } as BookCreationAttrs);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const bk = await Book.findByPk(book.id);
    return bk;
  }

  async findAll(reqUser: reqUser) {
    console.log(reqUser.userId, reqUser.roleId, reqUser.permissions);
    const hasReadAllPermission =
      reqUser.roleId === 1 || reqUser.permissions?.includes('read_all_books');

    if (hasReadAllPermission) {
      return this.bookModel.findAll();
    } else {
      return this.bookModel.findAll({
        where: { authorId: reqUser.userId },
      });
    }

    // const books = await this.bookModel.findAll();
    // return books;
    // .map((book) => book.get({ plain: true }));
  }
  async findById(id: number) {
    const book = await this.bookModel.findByPk(id);
    return book;
    // ?.get({ plain: true }); // MUST convert Sequelize instance
  }
  async findOne(id: number) {
    const book = await this.bookModel.findByPk(id);
    return book;
    // ?.get({ plain: true }); // MUST convert Sequelize instance
  }

  async update(book: Book, roleId: number, updateBookDto: UpdateBookDto) {
    if (roleId != 1 && updateBookDto.authorId) {
      throw new ForbiddenException('book.error.notAuthorChange');
    }

    if (updateBookDto.authorId) {
      const author = await User.findByPk(updateBookDto.authorId);
      if (!author) throw new NotFoundException('book.error.notFoundAuthor');
    }
    const ifExist = await this.bookModel.findOne({
      where: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [Op.and]: [{ name: updateBookDto.name }, { id: { [Op.not]: book.id } }],
      },
    });
    if (ifExist) {
      throw new BadRequestException('book.error.exists');
    }
    await book.update(updateBookDto);
    return book;
  }

  async remove(book: Book): Promise<void> {
    await book.destroy();
  }
}

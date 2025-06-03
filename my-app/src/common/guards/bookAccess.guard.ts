import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BooksService } from '../../api/v1/books/books.service';
import { reqUser } from '../interfaces/reqUser.interface';
// src/common/guards/book-access.guard.ts
@Injectable()
export class BookAccessGuard implements CanActivate {
  constructor(
    private readonly bookService: BooksService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: reqUser = request.user;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const bookId = request.params.id as number;
    const book = await this.bookService.findById(bookId);
    if (!book) {
      throw new ForbiddenException('Book not found');
    }
    if (user.roleId === 1) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.book = book;
      return true;
    }

    if (book.get('authorId') !== user.userId) {
      throw new ForbiddenException('You do not own this book');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    request.book = book;

    return true;
  }
}

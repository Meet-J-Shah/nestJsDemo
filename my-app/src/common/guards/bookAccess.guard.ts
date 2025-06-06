import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BooksService } from '../../api/v1/books/books.service';
import { reqUser } from '../interfaces/reqUser.interface';
import { I18nService } from 'nestjs-i18n';
// src/common/guards/book-access.guard.ts
@Injectable()
export class BookAccessGuard implements CanActivate {
  constructor(
    private readonly bookService: BooksService,
    private readonly reflector: Reflector,
    private readonly i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user: reqUser = request.user;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const lang: string =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.headers['x-custom-lang'] ??
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      request.headers['accept-language']?.split(',')[0] ??
      'en';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const bookId = request.params.id as number;
    const book = await this.bookService.findById(bookId);
    if (!book) {
      throw new ForbiddenException(
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await this.i18n.translate('book.error.notFound', { lang }),
      );
    }
    if (user.roleId === 1) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.book = book;
      return true;
    }

    if (book.get('authorId') !== user.userId) {
      throw new ForbiddenException(
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await this.i18n.translate('book.error.notOwned', { lang }),
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    request.book = book;

    return true;
  }
}

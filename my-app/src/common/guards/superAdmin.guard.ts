/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly i18n: I18nService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user = request.user;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const lang1: string =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.headers['x-custom-lang'] ??
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.headers['accept-language']?.split(',')[0] ??
      'en';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (user?.roleId !== 1) {
      throw new ForbiddenException(
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await this.i18n.translate('common.errors.notSuperAdmin', {
          lang: lang1,
          // args: { bookId },
        }),
      );
    }

    return true;
  }
}

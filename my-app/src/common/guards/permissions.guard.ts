/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { I18nService } from 'nestjs-i18n';
// import { UsersService } from '../../api/v1/users/users.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly i18n: I18nService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // no permissions required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const lang: string =
      request.headers['x-custom-lang'] ??
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      request.headers['accept-language']?.split(',')[0] ??
      'en';
    if (!user) {
      throw new ForbiddenException(
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await this.i18n.translate('common.errors.notAuthenticated', { lang }),
      );
    }

    const userPermissions: string[] = user.permissions || [];
    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await this.i18n.translate('common.errors.insufficientPermission', {
          lang,
        }),
      );
    }

    return true;
  }
}

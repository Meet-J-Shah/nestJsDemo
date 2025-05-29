/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nService } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  RESPONSE_MESSAGE_KEY,
  ResponseMessageMetadata,
} from '../decorators/responseMessage.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(
    private reflector: Reflector,
    private readonly i18n: I18nService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const meta = this.reflector.get<ResponseMessageMetadata>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const lang =
      request.headers['x-custom-lang'] ??
      request.headers['accept-language']?.split(',')[0] ??
      'en';

    return next.handle().pipe(
      switchMap(async (data) => {
        if (!meta) {
          return {
            success: true,
            message: null,
            data,
          };
        }

        const { translationKey, args: staticArgs } = meta;

        // Use dynamic args set by controller if available, else fall back to static ones
        const args =
          typeof request.i18nArgs === 'object'
            ? request.i18nArgs
            : typeof staticArgs === 'function'
              ? staticArgs(data)
              : staticArgs;

        try {
          const translatedMessage = await this.i18n.translate(translationKey, {
            lang,
            ...(args ? { args } : {}),
          });

          return {
            success: true,
            message: translatedMessage,
            data,
          };
        } catch (err) {
          console.error('Translation failed:', err);
          return {
            success: true,
            message: translationKey, // fallback to key
            data,
          };
        }
      }),
    );
  }
}

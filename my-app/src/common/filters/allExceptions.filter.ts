/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Request, Response } from 'express';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const lang =
      (request.headers['x-custom-lang'] as string) ??
      (request.headers['accept-language']?.split(',')[0] as string) ??
      'en';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'errors.INTERNAL_SERVER_ERROR'; // default i18n key
    let args = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const res = exceptionResponse as any;
        message = res.message || message;
        args = res.args || {};
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Translate the message using args
    try {
      if (typeof message === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        message = await this.i18n.translate(message, { lang, args });
      }
    } catch (error) {
      console.error('i18n translation failed:', error);
    }

    console.error(' Exception caught:', exception);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

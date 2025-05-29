/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/common/interceptors/global-transform.interceptor.ts

// src/common/interceptors/transform.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { TRANSFORM_DTO_KEY } from '../decorators/transform.dto';

@Injectable()
export class GlobalTransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const dto = this.reflector.get(TRANSFORM_DTO_KEY, context.getHandler());
    return next.handle().pipe(
      map((data) => {
        if (!dto) return data;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return plainToInstance(dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}

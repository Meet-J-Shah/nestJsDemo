import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { GlobalTransformInterceptor } from './common/interceptors/transform.interceptor';
import databaseConfig from './db/config/config';

// i18n support
import { I18nModule, AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n';

import * as path from 'path';

// Import versioned API module
import { V1Module } from './v1/v1.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    SequelizeModule.forRoot({
      ...databaseConfig[process.env.NODE_ENV || 'development'],
      autoLoadModels: true,
      synchronize: false,
      sync: {
        alter: false,
        force: false,
      },
      logging: true,
    }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'), // path to your translation JSON files
        watch: true, // enable live reload in dev
      },
      resolvers: [
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { use: QueryResolver, options: ['lang'] }, // check ?lang= query param
        AcceptLanguageResolver, // check Accept-Language header
      ],
    }),

    V1Module, //  All versioned features come from here
  ],

  controllers: [AppController],

  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalTransformInterceptor, // for error handling
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor, // innermost: formats success responses
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { GlobalTransformInterceptor } from './common/interceptors/transform.interceptor';
import databaseConfig from './db/config/config';

// i18n support
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';

// Import versioned API module
import { V1Module } from './v1/v1.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    SequelizeModule.forRoot({
      ...databaseConfig[process.env.NODE_ENV || 'development'],
      autoLoadModels: true,
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
        path: path.join(__dirname, '/i18n/'),
        // path: path.join(__dirname, '..', 'src', 'i18n'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),

    V1Module, //  All versioned features come from here
  ],

  controllers: [AppController],

  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalTransformInterceptor,
    },
  ],
})
export class AppModule {}

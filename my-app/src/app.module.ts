import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalTransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '',
      database: 'test_nestJs_sequalize',
      autoLoadModels: true,
      synchronize: true,
    }),
    BooksModule,
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

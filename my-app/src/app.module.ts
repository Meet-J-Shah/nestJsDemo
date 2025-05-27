import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalTransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import databaseConfig from './db/config/config';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      ...databaseConfig[process.env.NODE_ENV || 'development'],
      // dialect: 'mysql',
      // host: '127.0.0.1',
      // port: 3306,
      // username: 'root',
      // password: '',
      // database: 'test_nestJs_sequalize',
      autoLoadModels: true,
      synchronize: false, // Not used by Sequelize (just omit it)
      sync: {
        alter: false, //  Don't auto-alter tables
        force: false, //  Don't drop and recreate tables
      },
      logging: true,
    }),
    BooksModule,
    AuthModule,
    UsersModule,
    RolesModule,
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

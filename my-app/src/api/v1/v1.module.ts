import { Module } from '@nestjs/common';
import { BooksModule } from './books/books.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionModule } from './permissions/permission.module';

@Module({
  imports: [
    BooksModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionModule,
  ],
})
export class V1Module {}

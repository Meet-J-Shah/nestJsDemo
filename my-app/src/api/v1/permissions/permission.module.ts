import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Permission } from './models/permission.model';
import { RolePermission } from './models/rolePermission.model';
import { PermissionController } from './permission.controller';
import { UsersModule } from 'src/api/v1/users/users.module';

@Module({
  imports: [
    UsersModule,
    SequelizeModule.forFeature([Permission, RolePermission]),
  ],
  controllers: [PermissionController],
  providers: [PermissionService],
})
export class PermissionModule {}

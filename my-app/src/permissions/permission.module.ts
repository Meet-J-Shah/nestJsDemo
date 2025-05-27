import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { RolesController } from './permission.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './models/permission.model';

@Module({
  imports: [SequelizeModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [PermissionService],
})
export class RolesModule {}

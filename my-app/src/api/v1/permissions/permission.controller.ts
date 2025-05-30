/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  //   Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { PermissionService } from './permission.service';
import { CreateRolePermissionDto } from './dto/createRolePermission.dto';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import type { Request } from 'express';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  //   @Permissions('assign_permission')
  // @Post()
  // async assignPermissionToRole(
  //   @Body() dto: CreateRolePermissionDto,
  //   @Req() req: Request & { user: any },
  // ) {
  //   // passing roleId of requester from JWT user info
  //   return this.permissionService.create(dto, req.user.roleId);
  // }

  //   @Permissions('read_permission')
  @Get()
  async findAll(@Req() req: Request & { user: any }) {
    return this.permissionService.findAll(req.user.roleId);
  }

  //   @Permissions('read_permission')
  // @Get('assigned')
  // async findAllConnected(@Req() req: Request & { user: any }) {
  //   return this.permissionService.findAllConnected(req.user.roleId);
  // }

  //   @Permissions('read_permission')
  @Get('role/:id')
  async findByRoleId(
    @Param('id') roleId: number,
    @Req() req: Request & { user: any },
  ) {
    return this.permissionService.findOneByRole(roleId, req.user.roleId);
  }

  //   @Permissions('read_permission')
  @Get('permission/:id')
  async findByPermissionId(
    @Param('id') permissionId: number,
    @Req() req: Request & { user: any },
  ) {
    return this.permissionService.findOneByPermission(
      permissionId,
      req.user.roleId,
    );
  }

  //   @Permissions('read_permission')
  // @Get(':key1/:key2')
  // async findOneById(
  //   @Param('key1') roleId: number,
  //   @Param('key2') permissionId: number,
  //   @Req() req: Request & { user: any },
  // ) {
  //   return this.permissionService.findOneById(
  //     roleId,
  //     permissionId,
  //     req.user.roleId,
  //   );
  // }

  //   @Permissions('update_permission')
  //   @Patch(':key1/:key2')
  //   async update(
  //     @Param('key1') roleId: number,
  //     @Param('key2') permissionId: number,
  //     @Body() dto: CreateRolePermissionDto,
  //     @Req() req: Request & { user: any },
  //   ) {
  //     return this.permissionService.update(
  //       roleId,
  //       permissionId,
  //       dto,
  //       req.user.roleId,
  //     );
  //   }

  //   @Permissions('delete_permission')
  // @Delete(':key1/:key2')
  // async remove(
  //   @Param('key1') roleId: number,
  //   @Param('key2') permissionId: number,
  //   @Req() req: Request & { user: any },
  // ) {
  //   return this.permissionService.remove(roleId, permissionId, req.user.roleId);
  // }
}

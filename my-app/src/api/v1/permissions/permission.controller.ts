// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  //   Patch,
  Post,
  Put,
  // Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionService } from './permission.service';
import { CreateRolePermissionDto } from './dto/createRolePermission.dto';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import type { Request } from 'express';
import { ResponseMessage } from 'src/common/decorators/responseMessage.decorator';
import { SuperAdminGuard } from 'src/common/guards/superAdmin.guard';
import { IdParamDto } from './dto/idParams.dto';
import { CreatePermissionDto } from './dto/createPermission.dto';
import { UpdatePermissionDto } from './dto/updatePermission.dto';

@Controller('permissions')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ResponseMessage('permission.allFetched')
  @Get()
  async findAll() {
    return this.permissionService.findAll();
  }

  @ResponseMessage('permission.fetched')
  @Get(':id')
  async findPermission(@Param() params: IdParamDto) {
    return this.permissionService.findPermissionById(params.id);
  }

  @ResponseMessage('permission.created')
  @Post()
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.createPermission(createPermissionDto);
  }

  @ResponseMessage('permission.updated')
  @Patch(':id')
  updatePermission(
    @Param() params: IdParamDto,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.updatePermission(
      updatePermissionDto,
      params.id,
    );
  }
  @ResponseMessage('role.deleted')
  @Delete(':id')
  removePermission(@Param() params: IdParamDto) {
    return this.permissionService.deletePermission(params.id);
  }

  // @ResponseMessage('user.deleted')
  // @Get('assigned')  --> Not Possible If you Don't create a custom model for it..
  // async findAllConnected(@Req() req: Request & { user: any }) {
  //   return this.permissionService.findAllConnected(req.user.roleId);
  // }
  @ResponseMessage('permission.fetchedByRole')
  @Get('role/:id')
  async findByRoleId(@Param('id') roleId: number) {
    return this.permissionService.findOneByRole(roleId);
  }
  @ResponseMessage('permission.fetchedByPermission')
  @Get('permission/:id')
  async findByPermissionId(@Param('id') permissionId: number) {
    return this.permissionService.findOneByPermission(permissionId);
  }
  @ResponseMessage('permission.created2')
  @Post('role_permission')
  async assignPermissionToRole(@Body() dto: CreateRolePermissionDto) {
    console.log('🚀 DTO received at controller:', dto);
    return this.permissionService.createRolePermission(dto);
  }
  // ✅ Edit Permissions for a Role
  @Put('role/:id')
  async updatePermissionsOfRole(
    @Param('id') roleId: number,
    @Body('permissionIds') permissionIds: number[],
  ) {
    return this.permissionService.editRolePermissionWithRole(
      roleId,
      permissionIds,
    );
  }

  // ✅ Edit Roles for a Permission
  @Put('permission/:id')
  async updateRolesOfPermission(
    @Param('id') permissionId: number,
    @Body('roleIds') roleIds: number[],
  ) {
    return this.permissionService.editRolePermissionWithPermission(
      permissionId,
      roleIds,
    );
  }
  // @ResponseMessage('user.deleted')
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
  // @ResponseMessage('user.deleted')
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

  @ResponseMessage('permission.deleted2')
  @Delete('role_permission/:roleId/:permissionId')
  delete(@Param() params: CreateRolePermissionDto) {
    return this.permissionService.removeRolePermission(
      params.roleId,
      params.permissionId,
    );
  }
}

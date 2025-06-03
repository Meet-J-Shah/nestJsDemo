/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/createRole.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleIdParamDto } from './dto/roleIdParams.dto';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ResponseMessage } from 'src/common/decorators/responseMessage.decorator';
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ResponseMessage('role.created')
  @Permissions('create_role')
  @Post()
  create(@Request() req, @Body() createRoleDto: CreateRoleDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.rolesService.create(createRoleDto, req.user);
  }
  @ResponseMessage('role.allFetched')
  @Permissions('read_role')
  @Get()
  findAll(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.rolesService.findAll(req.user);
  }

  // @Get('/profileV3')
  // getProfile(@Request() req) {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  //   return req.user;
  // }

  @ResponseMessage('role.fetched')
  @Permissions('read_role')
  @Get(':id')
  findOne(@Request() req, @Param() params: RoleIdParamDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.rolesService.findOne(params.id, req.user);
  }
  @ResponseMessage('role.updated')
  @Permissions('update_role')
  @Patch(':id')
  update(
    @Request() req,
    @Param() params: RoleIdParamDto,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.rolesService.update(params.id, updateRoleDto, req.user);
  }
  @ResponseMessage('role.deleted')
  @Permissions('delete_role')
  @Delete(':id')
  remove(@Request() req, @Param() params: RoleIdParamDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.rolesService.remove(params.id, req.user);
  }
}

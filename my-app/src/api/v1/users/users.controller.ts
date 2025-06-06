/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserIdParamDto } from './dto/userIdParam.dto';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import type { Request } from 'express';
import { ResponseMessage } from 'src/common/decorators/responseMessage.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard, PermissionsGuard) // Apply JwtAuthGuard to entire controller
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @ResponseMessage('user.created')
  @Permissions('create_user')
  @Post()
  create(
    @Req() req: Request & { user: any },
    @Body() createUserDto: CreateUserDto,
  ): Promise<any> {
    return this.usersService.create(createUserDto, req.user);
  }

  @ResponseMessage('user.allFetched')
  @Permissions('read_user')
  @Get()
  findAll(@Req() req: Request & { user: any }): Promise<any> {
    return this.usersService.findAll(req.user);
  }

  @ResponseMessage('user.fetched')
  @Permissions('read_user')
  @Get(':id')
  findOne(
    @Req() req: Request & { user: any; i18nArgs?: Record<string, any> },
    @Param() { id }: UserIdParamDto,
  ) {
    req.i18nArgs = { id }; // <-- Set dynamic args here for translation
    return this.usersService.findOneV2(id, req.user);
  }

  @ResponseMessage('user.updated')
  @Permissions('update_user')
  @Patch(':id')
  update(
    @Req() req: Request & { user: any },
    @Param() { id }: UserIdParamDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<any> {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @ResponseMessage('user.deleted')
  @Permissions('delete_user')
  @Delete(':id')
  remove(
    @Req() req: Request & { user: any },
    @Param() { id }: UserIdParamDto,
  ): Promise<any> {
    return this.usersService.remove(id, req.user);
  }
}

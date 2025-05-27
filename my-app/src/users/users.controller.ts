/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserIdParamDto } from './dto/userIdParam.dto';
@Controller('user')
export class UserController {
  constructor(private readonly UsersService: UsersService) {}
  @UseGuards(JwtAuthGuard)
  @Get('profileV2')
  getProfile(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createUserDto: CreateUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.UsersService.create(createUserDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.UsersService.findAll(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Request() req, @Param() params: UserIdParamDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.UsersService.findOneV2(params.id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Request() req,
    @Param() params: UserIdParamDto,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.UsersService.update(params.id, updateUserDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req, @Param() params: UserIdParamDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.UsersService.remove(params.id, req.user);
  }
}

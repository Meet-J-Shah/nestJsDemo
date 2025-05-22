import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dto/createUser.dto';
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
    const userId = +req.user.userId;
    return this.UsersService.create(createUserDto, userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = +req.user.userId;
    return this.UsersService.findAll(userId);
  }
}

import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@Controller()
export class UserController {
  constructor(private readonly UsersService: UsersService) {}
  @UseGuards(JwtAuthGuard)
  @Get('profileV2')
  getProfile(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return req.user;
  }
  // @Post()
  // create(@Body() createBookDto: CreateBookDto) {
  //   return this.booksService.create(createBookDto);
  // }
}

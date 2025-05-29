import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
// import { Request, Post, UseGuards } from '@nestjs/common';
// // import { AuthGuard } from '@nestjs/passport';
// import { LocalAuthGuard } from './v1/auth/local.auth.guard';
// import { JwtAuthGuard } from './v1/auth/jwt-auth.guard';
// import { AuthService } from './v1/auth/auth.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // private authService: AuthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @UseGuards(AuthGuard('local'))
  // @Post('auth/login')
  // // eslint-disable-next-line @typescript-eslint/require-await
  // async login(@Request() req) {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
  //   return req.user;
  // }

  // @UseGuards(LocalAuthGuard)
  // @Post('auth/login')
  // login(@Request() req) {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  //   return req.user;
  // }
  // @UseGuards(LocalAuthGuard)
  // @Post('auth/login')
  // async login(@Request() req) {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  //   return this.authService.login(req.user);
  // }
  // @UseGuards(LocalAuthGuard)
  // @Post('auth/logout')
  // logout(@Request() req) {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  //   return req.logout();
  // }
  // @UseGuards(LocalAuthGuard)
  // @Post('auth/login')
  // async login(@Request() req) {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
  //   return this.authService.login(req.user);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // getProfile(@Request() req) {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  //   return req.user;
  // }
}

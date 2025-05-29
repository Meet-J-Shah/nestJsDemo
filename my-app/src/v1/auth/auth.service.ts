/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/v1/users/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    const dbPassword = user?.dataValues.password;
    if (user && dbPassword === pass) {
      return user;
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async login(user: User) {
    const payload = { username: user.dataValues.userName, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '1h',
      }),
    };
  }
}

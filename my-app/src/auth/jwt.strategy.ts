import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { User } from 'src/users/models/user.model';
import { reqUser } from 'src/common/interfaces/reqUser.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    const reqUser = await User.findByPk(payload.sub);
    if (!reqUser) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new NotFoundException(`User with id ${payload.sub} not found`);
    }
    const user: reqUser = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      userId: reqUser.dataValues.id,
      roleId: reqUser.dataValues.roleId,
      username: reqUser.dataValues.userName,
    };
    return user;
  }
}

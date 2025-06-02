/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { jwtConstants } from './constants';
import { User } from 'src/api/v1/users/models/user.model';
// import { reqUser } from 'src/common/interfaces/reqUser.interface';
import { Role } from '../roles/models/role.model';
import { Permission } from '../permissions/models/permission.model';

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
    // Fetch the user with role and permissions
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const user = await User.findByPk(payload.sub, {
      include: [
        {
          model: Role,
          as: 'role',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${payload.sub} not found`);
    }

    // Extract permission names
    const permissions = user.dataValues.role.dataValues.permissions;
    const perms: string[] = [];
    permissions.forEach((element) => {
      perms.push(element.dataValues.name);
    });
    // console.log(
    //   // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    //   ` User fetched with ID: ${user.id}, Role: ${user.dataValues.role?.dataValues.name}, Permissions: ${perms}`,
    // );
    return {
      userId: user.id,
      roleId: user.dataValues.roleId,
      username: user.dataValues.userName,
      permissions: perms, // attach permissions here
    };
  }
}

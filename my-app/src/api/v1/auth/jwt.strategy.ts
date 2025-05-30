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
import { console } from 'inspector';

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
    console.log('dsbgkj');
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
    // console.log(user.dataValues.role.dataValues.permissions);
    console.log(user);
    const permissions = user.role?.permissions?.map((p) => p.name) || [];
    // const mj = user.dataValues.role.dataValues.permissions;
    // console.log(mj);

    // const perms: string[] = [];

    // const plainUser = user.toJSON(); // Converts entire nested object
    // const permissions2 = plainUser.role.permissions.map((perm) => perm.name);
    // console.log('Permissions:', permissions2);

    // mj.forEach((element) => {
    //   perms.push(element.dataValues.name);
    //   console.log(element);
    // });
    // console.log('dnf', perms);
    return {
      userId: user.id,
      roleId: user.roleId,
      username: user.userName,
      permissions, // attach permissions here
    };
  }
}

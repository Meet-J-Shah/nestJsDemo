import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/createRole.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { User } from 'src/users/models/user.model';
import { Role } from './models/role.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role)
    private readonly roleModel: typeof Role,
  ) {}
  async create(createRoleDto: CreateRoleDto, userId: number) {
    // console.log(createRoleDto, userId);
    const user = await User.findByPk(userId);
    if (!user) {
      return 0;
    }
    const userRole = user.dataValues.roleId;
    // console.log('user', user);
    if (createRoleDto.parentId) {
      const parentRole = await Role.findByPk(createRoleDto.parentId);
      if (parentRole) {
        createRoleDto.parentId = Math.max(createRoleDto.parentId, userRole);
        const createRoleData = {
          name: createRoleDto.name,
          creatorId: user?.dataValues.id as number,
          parentId: createRoleDto.parentId,
        };
        // console.log(createRoleData);
        const role = await this.roleModel.create(
          createRoleData as CreationAttributes<Role>,
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const bk = await Role.findByPk(role.id);
        return bk;
      }
    }

    // console.log(userRole);
    // const level = userRole?.dataValues.level as number;
    const createRoleData = {
      name: createRoleDto.name,
      creatorId: user?.dataValues.id as number,
      parentId: createRoleDto.parentId,
    };
    // console.log(createRoleData);
    const role = await this.roleModel.create(
      createRoleData as CreationAttributes<Role>,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const bk = await Role.findByPk(role.id);
    return bk;
  }

  async findAll(userId: number) {
    const user = await User.findByPk(userId);
    // const userRole = await Role.findByPk(user?.dataValues.roleId);
    const roleId = user?.dataValues.roleId ?? Infinity;
    async function getAllDescendants(
      roleId: number,
      result: Role[] = [],
    ): Promise<Role[]> {
      const children = await Role.findAll({
        where: { parentId: roleId },
      });

      for (const child of children) {
        result.push(child);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await getAllDescendants(child.dataValues.id, result);
      }

      return result;
    }
    const allChildren = await getAllDescendants(roleId);
    return allChildren;
    // console.log(userRole);
    // const userRoleLevel = userRole?.dataValues.level as number;
    // const roles = this.roleModel.findAll({
    //   // where: {
    //   //   level: {
    //   //     [Op.gt]: userRoleLevel,
    //   //   },
    //   // },
    // });
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}

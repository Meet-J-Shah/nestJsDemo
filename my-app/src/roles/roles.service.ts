import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/createRole.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { User } from 'src/users/models/user.model';
import { Role } from './models/role.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';
import {
  getAllDescendants,
  isAncestor,
} from 'src/common/utils/getAllDescendants';

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

    const allChildren = await getAllDescendants(Role, roleId);
    return allChildren;
  }

  async findOne(id: number, userId: number) {
    const role = await this.roleModel.findByPk(id);
    if (!role) {
      return 'Not Found Error';
    }
    const creatorParent = await isAncestor(
      User,
      userId,
      role.dataValues.creatorId,
    );
    if (!creatorParent) {
      return "You can't see It";
    }
    const reqUser = await User.findByPk(userId);
    if (!reqUser) {
      return 'User not found';
    }
    const reqUserAncestor = await isAncestor(
      Role,
      reqUser.dataValues.roleId,
      id,
    );
    if (!reqUserAncestor) {
      return "Sorry, You don't have acess to see this role";
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto, userId: number) {
    const role = await this.roleModel.findByPk(id, { paranoid: false });
    if (!role) {
      return 'Not Found Error';
    }
    const asscoiateUser = await User.findOne({ where: { id: userId } });
    const creatorParent = await isAncestor(
      User,
      userId,
      role.dataValues.creatorId,
    );
    if (!creatorParent) {
      return "You can't modify It";
    }
    if (!updateRoleDto.parentId) {
      await role.update(updateRoleDto);
      return role;
    }
    async function validateRoleHierarchy(
      userroleId: number,
      roleId: number,
      updatedParentroleId: number,
    ): Promise<boolean> {
      // Check if updatedParentroleId is ancestor of roleId
      const updatedIsAncestorOfRole = await isAncestor(
        Role,
        roleId,
        updatedParentroleId,
      );
      console.log('mj4');
      if (updatedIsAncestorOfRole) return false;

      // Check if userroleId is same as updatedParentroleId or ancestor of updatedParentroleId
      if (userroleId === updatedParentroleId) return true;

      const userIsAncestorOfUpdated = await isAncestor(
        Role,
        userroleId,
        updatedParentroleId,
      );
      return userIsAncestorOfUpdated;
    }
    console.log(
      asscoiateUser?.dataValues.roleId,
      id,
      updateRoleDto.parentId ?? Infinity,
    );
    const valid = await validateRoleHierarchy(
      asscoiateUser?.dataValues.roleId as number,
      id,
      updateRoleDto.parentId ?? Infinity,
    );
    if (valid) {
      console.log('Hierarchy conditions satisfied.');
      await role.update(updateRoleDto);
      return role;
    } else {
      console.log('Hierarchy conditions failed.');
      return 'Not Valid';
    }
  }

  async remove(id: number, userId: number) {
    const role = await this.roleModel.findByPk(id);
    if (!role) {
      return 'Not Found Error';
    }
    const creatorParent = await isAncestor(
      User,
      userId,
      role.dataValues.creatorId,
    );
    if (!creatorParent) {
      return "You can't delete It";
    }
    const reqUser = await User.findByPk(userId);
    if (!reqUser) {
      return 'User not found';
    }
    const reqUserAncestor = await isAncestor(
      Role,
      reqUser.dataValues.roleId,
      id,
    );
    if (!reqUserAncestor) {
      return "Sorry, You don't have acess to delete this role";
    }
    const users = await User.findOne({ where: { roleId: id } });
    if (users) {
      return "Users asscoaite with this roleyou can't delete it";
    }
    await role.destroy();
    return `role deleted having id:- ${id}`;
  }
}

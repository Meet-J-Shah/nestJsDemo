import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const userRoleId = user.dataValues.roleId;

    if (createRoleDto.parentId) {
      const parentRole = await this.roleModel.findByPk(createRoleDto.parentId);
      if (!parentRole) {
        throw new NotFoundException(
          `Parent role with id ${createRoleDto.parentId} not found`,
        );
      }

      // Check if user has permission to use this parent role
      const userCanAssignParent = await isAncestor(
        Role,
        userRoleId,
        createRoleDto.parentId,
      );

      if (!userCanAssignParent && userRoleId !== createRoleDto.parentId) {
        throw new ForbiddenException(
          "You don't have permission to use this parent role",
        );
      }
    }

    const newRole = await this.roleModel.create({
      name: createRoleDto.name,
      creatorId: userId,
      parentId: createRoleDto.parentId ?? userRoleId, // Default to user role if none provided
    } as CreationAttributes<Role>);

    return this.roleModel.findByPk(+newRole.dataValues.id);
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
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    const creatorParent = await isAncestor(
      User,
      userId,
      role.dataValues.creatorId,
    );
    if (!creatorParent) {
      throw new ForbiddenException(
        `You don't have permission to view this role`,
      );
    }
    const reqUser = await User.findByPk(userId);
    if (!reqUser) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const reqUserAncestor = await isAncestor(
      Role,
      reqUser.dataValues.roleId,
      id,
    );
    if (!reqUserAncestor) {
      throw new ForbiddenException(`You don't have access to view this role`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto, userId: number) {
    const role = await this.roleModel.findByPk(id, { paranoid: false });
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    const asscoiateUser = await User.findOne({ where: { id: userId } });
    if (!asscoiateUser) {
      throw new NotFoundException(
        `Requesting user with id ${userId} not found`,
      );
    }
    const creatorParent = await isAncestor(
      User,
      userId,
      role.dataValues.creatorId,
    );
    if (!creatorParent) {
      throw new ForbiddenException(
        `You don't have permission to modify this role`,
      );
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
    const valid = await validateRoleHierarchy(
      asscoiateUser.dataValues.roleId,
      id,
      updateRoleDto.parentId ?? Infinity,
    );
    if (valid) {
      console.log('Hierarchy conditions satisfied.');
      await role.update(updateRoleDto);
      return role;
    } else {
      console.log('Hierarchy conditions failed.');
      throw new ForbiddenException(
        'Hierarchy validation failed. Operation not permitted.',
      );
    }
  }

  async remove(id: number, userId: number) {
    const role = await this.roleModel.findByPk(id);
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    const creatorParent = await isAncestor(
      User,
      userId,
      role.dataValues.creatorId,
    );
    if (!creatorParent) {
      throw new ForbiddenException(
        "You can't delete this role — not in your user hierarchy",
      );
    }
    const reqUser = await User.findByPk(userId);
    if (!reqUser) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const reqUserAncestor = await isAncestor(
      Role,
      reqUser.dataValues.roleId,
      id,
    );
    if (!reqUserAncestor) {
      throw new ForbiddenException(
        "Sorry, You don't have acess to delete this role",
      );
    }
    const users = await User.findOne({ where: { roleId: id } });
    if (users) {
      throw new ForbiddenException(
        "Users asscoaite with this role you can't delete it",
      );
    }
    await role.destroy();
    return `role deleted having id:- ${id}`;
  }
}

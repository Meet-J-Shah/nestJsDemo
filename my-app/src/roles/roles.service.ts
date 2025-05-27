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
import { reqUser } from 'src/common/interfaces/reqUser.interface';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role)
    private readonly roleModel: typeof Role,
  ) {}

  async create(createRoleDto: CreateRoleDto, reqUser: reqUser) {
    const userRoleId = reqUser.roleId;

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
      creatorId: reqUser.userId,
      parentId: createRoleDto.parentId ?? userRoleId, // Default to user role if none provided
    } as CreationAttributes<Role>);

    return this.roleModel.findByPk(+newRole.dataValues.id);
  }

  async findAll(reqUser: reqUser) {
    const allChildren = await getAllDescendants(Role, reqUser.roleId);
    return allChildren;
  }

  async findOne(id: number, reqUser: reqUser) {
    const role = await this.roleModel.findByPk(id);
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    const creatorParent = await isAncestor(
      User,
      reqUser.userId,
      role.dataValues.creatorId,
    );
    if (!creatorParent) {
      throw new ForbiddenException(
        `You don't have permission to view this role`,
      );
    }

    const reqUserAncestor = await isAncestor(Role, reqUser.roleId, id);
    if (!reqUserAncestor) {
      throw new ForbiddenException(`You don't have access to view this role`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto, reqUser: reqUser) {
    const role = await this.roleModel.findByPk(id, { paranoid: false });
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    const creatorParent = await isAncestor(
      User,
      reqUser.userId,
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
      userRoleId: number,
      roleId: number,
      updatedParentroleId: number,
    ): Promise<boolean> {
      // Check if updatedParentroleId is ancestor of roleId
      const updatedIsAncestorOfRole = await isAncestor(
        Role,
        roleId,
        updatedParentroleId,
      );
      if (updatedIsAncestorOfRole) return false;

      // Check if userRoleId is same as updatedParentroleId or ancestor of updatedParentroleId
      if (userRoleId === updatedParentroleId) return true;

      const userIsAncestorOfUpdated = await isAncestor(
        Role,
        userRoleId,
        updatedParentroleId,
      );
      return userIsAncestorOfUpdated;
    }
    const valid = await validateRoleHierarchy(
      reqUser.roleId,
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

  async remove(id: number, reqUser: reqUser) {
    const role = await this.roleModel.findByPk(id);
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    const creatorParent = await isAncestor(
      User,
      reqUser.userId,
      role.dataValues.creatorId,
    );
    if (!creatorParent) {
      throw new ForbiddenException(
        "You can't delete this role — not in your user hierarchy",
      );
    }
    const reqUserAncestor = await isAncestor(Role, reqUser.roleId, id);
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

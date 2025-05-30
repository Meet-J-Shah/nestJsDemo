import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/createRole.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { User } from 'src/users/models/user.model';
import { Role } from './models/role.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes, Op } from 'sequelize';
import {
  // getAllDescendants,
  getAncestryPath,
  isAncestorCTEWithSequelize,
} from 'src/common/utils/getAllDescendants';
import { reqUser } from 'src/common/interfaces/reqUser.interface';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role)
    private readonly roleModel: typeof Role,
    private readonly sequelize: Sequelize,
  ) {}

  async create(createRoleDto: CreateRoleDto, reqUser: reqUser) {
    const userRoleId = reqUser.roleId;
    const ifExist = await Role.findOne({ where: { name: createRoleDto.name } });
    if (ifExist) {
      throw new BadRequestException(
        'Role With This name Already Exist in The Db',
      );
    }
    if (createRoleDto.parentId) {
      const parentRole = await this.roleModel.findByPk(createRoleDto.parentId);
      if (!parentRole) {
        throw new NotFoundException(
          `Parent role with id ${createRoleDto.parentId} not found`,
        );
      }

      // Check if user has permission to use this parent role
      const userCanAssignParent = await isAncestorCTEWithSequelize(
        this.sequelize,
        'roles',
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
    async function getUserWithAllChildren(userId: number): Promise<any> {
      const role = await Role.findOne({
        where: { id: userId },
        include: [{ model: Role, as: 'children' }],
      });

      if (!role) return null;

      // Recursively fetch children
      if (role.children && role.children.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        role.children = await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          role.children.map((child: any) => getUserWithAllChildren(child.id)),
        );
      }

      return role;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const allChildren = await getUserWithAllChildren(reqUser.roleId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return allChildren;
  }

  async findOne(id: number, reqUser: reqUser) {
    const role = await this.roleModel.findByPk(id);
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    const creatorParent = await isAncestorCTEWithSequelize(
      this.sequelize,
      'users',
      reqUser.userId,
      role.dataValues.creatorId,
    );
    if (!creatorParent) {
      throw new ForbiddenException(
        `You don't have permission to view this role`,
      );
    }

    const reqUserAncestor = await isAncestorCTEWithSequelize(
      this.sequelize,
      'roles',
      reqUser.roleId,
      id,
    );
    if (!reqUserAncestor) {
      throw new ForbiddenException(`You don't have access to view this role`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto, reqUser: reqUser) {
    const role = await this.roleModel.findByPk(id, { paranoid: false });
    const ifExist = await Role.findOne({
      where: {
        [Op.and]: [{ name: updateRoleDto.name }, { id: { [Op.not]: id } }],
      },
    });
    if (ifExist) {
      throw new BadRequestException(
        'Role With This name Already Exist in The Db',
      );
    }
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    const creatorParent = await isAncestorCTEWithSequelize(
      this.sequelize,
      'users',
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
    const validateRoleHierarchy = async (
      userRoleId: number,
      roleId: number,
      updatedParentroleId: number,
    ): Promise<boolean> => {
      const hierarchy = await getAncestryPath(this.sequelize, 'roles', roleId);
      const idIndex = hierarchy.indexOf(roleId);
      const requestUserIdIndex = hierarchy.indexOf(userRoleId);
      // Check if updatedParentroleId is ancestor of roleId
      const updatedIsAncestorOfRole = await isAncestorCTEWithSequelize(
        this.sequelize,
        'roles',
        roleId,
        updatedParentroleId,
      );
      if (updatedIsAncestorOfRole) return false;
      const validReqUser = await isAncestorCTEWithSequelize(
        this.sequelize,
        'roles',
        userRoleId,
        updatedParentroleId,
      );
      // Check if userRoleId is same as updatedParentroleId or ancestor of updatedParentroleId
      if (userRoleId === updatedParentroleId) return true;

      const userIsAncestorOfUpdated =
        requestUserIdIndex < idIndex && validReqUser;
      return userIsAncestorOfUpdated;
    };
    const valid = await validateRoleHierarchy(
      reqUser.roleId,
      id,
      updateRoleDto.parentId,
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
    const creatorParent = await isAncestorCTEWithSequelize(
      this.sequelize,
      'users',
      reqUser.userId,
      role.dataValues.creatorId,
    );
    if (!creatorParent) {
      throw new ForbiddenException(
        "You can't delete this role — not in your user hierarchy",
      );
    }
    const reqUserAncestor = await isAncestorCTEWithSequelize(
      this.sequelize,
      'roles',
      reqUser.roleId,
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

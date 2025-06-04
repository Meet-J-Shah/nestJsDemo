import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/createRole.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { User } from 'src/api/v1/users/models/user.model';
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
      throw new BadRequestException('role.error.exists');
    }
    if (createRoleDto.parentId) {
      const parentRole = await this.roleModel.findByPk(createRoleDto.parentId);
      if (!parentRole) {
        throw new NotFoundException({
          message: 'role.error.parentNotFound',
          args: { id: createRoleDto.parentId },
        });
      }

      // Check if user has permission to use this parent role
      const userCanAssignParent = await isAncestorCTEWithSequelize(
        this.sequelize,
        'roles',
        userRoleId,
        createRoleDto.parentId,
      );

      if (!userCanAssignParent && userRoleId !== createRoleDto.parentId) {
        throw new ForbiddenException('role.error.noModifyPermissionParent');
      }
    }

    const newRole = await this.roleModel.create({
      name: createRoleDto.name,
      creatorId: reqUser.userId,
      parentId: createRoleDto.parentId ?? userRoleId, // Default to user role if none provided
    } as CreationAttributes<Role>);

    return this.roleModel.findByPk(newRole.get('id') as number);
  }

  async findAll(reqUser: reqUser) {
    async function getUserWithAllChildren(userId: number): Promise<any> {
      const role = await Role.findOne({
        where: { id: userId },
        include: [{ model: Role, as: 'children' }],
      });

      if (!role) return null;
      const roleJSON = role.toJSON();
      // Recursively fetch children
      if (roleJSON.children && roleJSON.children.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        roleJSON.children = await Promise.all(
          // eslint-disable-next-line, @typescript-eslint/no-unsafe-member-access
          roleJSON.children.map((child: any) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            getUserWithAllChildren(child.id),
          ),
        );
      }

      return roleJSON;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const allChildren = await getUserWithAllChildren(reqUser.roleId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return allChildren;
  }

  async findOne(id: number, reqUser: reqUser) {
    const role = await this.roleModel.findByPk(id);
    if (!role) {
      throw new NotFoundException({
        message: 'role.error.notFound',
        args: { id },
      });
    }
    const creatorParent = await isAncestorCTEWithSequelize(
      this.sequelize,
      'users',
      reqUser.userId,
      role.get('creatorId'),
    );
    if (!creatorParent) {
      throw new ForbiddenException('role.error.noViewPermission');
    }

    const reqUserAncestor = await isAncestorCTEWithSequelize(
      this.sequelize,
      'roles',
      reqUser.roleId,
      id,
    );
    if (!reqUserAncestor) {
      throw new ForbiddenException('role.error.hierarchyViolation');
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
      throw new BadRequestException('role.error.exists');
    }
    if (!role) {
      throw new NotFoundException({
        message: 'role.error.notFound',
        args: { id },
      });
    }

    const creatorParent = await isAncestorCTEWithSequelize(
      this.sequelize,
      'users',
      reqUser.userId,
      role.get('creatorId'),
    );
    if (!creatorParent) {
      throw new ForbiddenException('role.error.noModifyPermission');
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
      // console.log('Hierarchy conditions satisfied.');
      await role.update(updateRoleDto);
      return role;
    } else {
      // console.log('Hierarchy conditions failed.');
      throw new ForbiddenException('role.error.hierarchyViolation');
    }
  }

  async remove(id: number, reqUser: reqUser) {
    const role = await this.roleModel.findByPk(id);
    if (!role) {
      throw new NotFoundException({
        message: 'role.error.notFound',
        args: { id },
      });
    }
    const creatorParent = await isAncestorCTEWithSequelize(
      this.sequelize,
      'users',
      reqUser.userId,
      role.get('creatorId'),
    );
    if (!creatorParent) {
      throw new ForbiddenException('role.error.notUserChild');
    }
    const reqUserAncestor = await isAncestorCTEWithSequelize(
      this.sequelize,
      'roles',
      reqUser.roleId,
      id,
    );
    if (!reqUserAncestor) {
      throw new ForbiddenException('role.error.noDeletePermission');
    }
    const users = await User.findOne({ where: { roleId: id } });
    if (users) {
      throw new ForbiddenException('role.error.associatedUsers');
    }
    await role.destroy();
    return `role deleted having id:- ${id}`;
  }
}

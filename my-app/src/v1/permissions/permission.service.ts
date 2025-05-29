import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Permission } from './models/permission.model';
import { Role } from 'src/v1/roles/models/role.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';
import { RolePermission } from './models/rolePermission.model';
import { CreateRolePermissionDto } from './dto/createRolePermission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission)
    private readonly permissionModel: typeof Permission,
  ) {}

  async create(createRolePermission: CreateRolePermissionDto, roleId: number) {
    if (roleId !== 1) {
      throw new BadRequestException('Permission Only See By Super Admin');
    }
    const role = await Role.findByPk(createRolePermission.roleId);
    const permission = await Permission.findByPk(
      createRolePermission.permissionId,
    );
    if (!role || !permission) {
      throw new BadRequestException(
        'Seleted  Role Or Permission does not Exist',
      );
    }
    const rolePermission = await RolePermission.create({
      roleId: createRolePermission.roleId,
      permissionId: createRolePermission.permissionId,
    } as CreationAttributes<RolePermission>);
    return rolePermission;
  }

  async findAll(roleId: number) {
    if (roleId !== 1) {
      throw new BadRequestException('Permission Only See By Super Admin');
    }
    const permissions = await Permission.findAll();
    return permissions;
  }
  async findAllConnected(roleId: number) {
    if (roleId !== 1) {
      throw new BadRequestException('Permission Only See By Super Admin');
    }
    const permissions = await RolePermission.findAll();
    return permissions;
  }

  async findOneByRole(id: number, roleId: number) {
    if (roleId !== 1) {
      throw new BadRequestException('Permission Only See By Super Admin');
    }
    const role = await Role.findOne({
      where: { id: id },
      include: {
        model: Permission,
        as: 'permissions',
        through: { attributes: [] },
      },
    });
    return role;
  }
  async findOneByPermission(id: number, roleId: number) {
    if (roleId !== 1) {
      throw new BadRequestException('Permission Only See By Super Admin');
    }
    const permission = await Permission.findOne({
      where: { id: id },
      include: {
        model: Role,
        as: 'roles',
        through: { attributes: [] },
      },
    });
    return permission;
  }
  async findOneById(
    roleId: number,
    permissionId: number,
    reqUserRoleId: number,
  ) {
    if (reqUserRoleId !== 1) {
      throw new BadRequestException('Permission Only See By Super Admin');
    }
    const permission = await RolePermission.findOne({
      where: { roleId: roleId, permissionId: permissionId },
    });
    if (!permission) {
      throw new NotFoundException('Requested this does not exist ');
    }
    return permission;
  }

  // async update(
  //   roleId: number,
  //   permissionId: number,
  //   updateRolePermission: CreateRolePermissionDto,
  //   reqUserRoleId: number,
  // ) {
  //   if (reqUserRoleId !== 1) {
  //     throw new BadRequestException('Permission Only See By Super Admin');
  //   }
  //   const role = await Role.findByPk(updateRolePermission.roleId);
  //   const permission = await Permission.findByPk(
  //     updateRolePermission.permissionId,
  //   );
  //   const rolePermission = await RolePermission.findOne({
  //     where: {
  //       roleId: roleId,
  //       permissionId: permissionId,
  //     },
  //   });
  //   if (!role || !permission || !rolePermission) {
  //     throw new BadRequestException(
  //       'Seleted  Role Or Permission Or given associate Id  does not Exist',
  //     );
  //   }
  //   console.log(updateRolePermission.roleId, updateRolePermission.permissionId);
  //   // const mj = await rolePermission.update({
  //   //   roleId: 2,
  //   //   permissionId: 7,
  //   // });
  //   // console.log('meer');
  //   const mj = await rolePermission.update(updateRolePermission);
  //   console.log(mj);
  //   return rolePermission;
  // }

  async remove(roleId: number, permissionId: number, reqUserRoleId: number) {
    if (reqUserRoleId !== 1) {
      throw new BadRequestException('Permission Only See By Super Admin');
    }
    const permission = await RolePermission.findOne({
      where: { roleId: roleId, permissionId: permissionId },
    });
    if (!permission) {
      throw new NotFoundException('Requested this does not exist ');
    }

    await permission.destroy();
    return `Permission of havind Id ${permission.permissionId} to assigned 
        to role Having Id ${permission.roleId}is removed`;
  }
}

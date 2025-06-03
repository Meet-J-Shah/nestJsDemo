import {
  BadRequestException,
  // BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Permission } from './models/permission.model';
import { Role } from 'src/api/v1/roles/models/role.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateRolePermissionDto } from './dto/createRolePermission.dto';
import { RolePermission } from './models/rolePermission.model';
import { CreatePermissionDto } from './dto/createPermission.dto';
import { UpdatePermissionDto } from './dto/updatePermission.dto';
import { CreationAttributes } from 'sequelize/types/model';
import { Sequelize } from 'sequelize-typescript';
// import { QueryTypes } from 'sequelize';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission)
    private readonly permissionModel: typeof Permission,
    @InjectModel(RolePermission)
    private readonly rolePermissionModel: typeof RolePermission,
    private readonly sequelize: Sequelize,
  ) {}

  async findAll() {
    const permissions = await Permission.findAll();
    return permissions;
  }
  async findPermissionById(permissionId: number) {
    const permission = await Permission.findByPk(permissionId);
    if (!permission) {
      throw new NotFoundException('Requested ID of permission does not exist ');
    }
    return permission;
  }
  async createPermission(createPermissionData: CreatePermissionDto) {
    const ifExist = await this.permissionModel.findOne({
      where: { name: createPermissionData.name },
    });
    if (ifExist) {
      throw new BadRequestException(
        'Permission already exist with requested permission name',
      );
    }
    const permission = await this.permissionModel.create(
      createPermissionData as CreationAttributes<Permission>,
    );

    const ps = await this.permissionModel.findByPk(permission.id as number);
    return ps;
  }
  async updatePermission(
    updatePermissionData: UpdatePermissionDto,
    permissionId: number,
  ) {
    const permission = await this.permissionModel.findByPk(permissionId);
    if (!permission) {
      throw new NotFoundException({
        message: 'role.error.notFound',
        args: { id: permissionId },
      });
    }

    await permission.update(updatePermissionData);
    return permission;
  }
  async deletePermission(permissionId: number) {
    const permission = await this.permissionModel.findByPk(permissionId);
    if (!permission) {
      throw new NotFoundException({
        message: 'role.error.notFound',
        args: { id: permissionId },
      });
    }
    await permission.destroy();
  }

  // Role -Permission functionality
  async findAllConnected() {
    const rolePermissions = await RolePermission.findAll({
      include: [
        {
          model: Role,
          attributes: ['id', 'name'],
        },
        {
          model: Permission,
          attributes: ['id', 'name'],
        },
      ],
    });
    return rolePermissions;
  }

  async findOneByRole(id: number) {
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

  async findOneByPermission(id: number) {
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

  // async createRolePermission(createRolePermission: CreateRolePermissionDto) {
  //   const role = await Role.findByPk(createRolePermission.roleId);
  //   const permission = await Permission.findByPk(
  //     createRolePermission.permissionId,
  //   );
  //   if (!role || !permission) {
  //     throw new BadRequestException(
  //       'Selected  Role Or Permission does not Exist',
  //     );
  //   }
  //   const ifExist = await RolePermission.findOne({
  //     where: {
  //       roleId: createRolePermission.roleId,
  //       permissionId: createRolePermission.permissionId,
  //     },
  //   });
  //   if (ifExist) {
  //     throw new BadRequestException(
  //       'Request Permission is already have requested role ',
  //     );
  //   }
  //   console.log(createRolePermission);
  //   console.log('👉 DTO at service:', createRolePermission);
  //   console.log(
  //     '👉 roleId:',
  //     createRolePermission.roleId,
  //     'permissionId:',
  //     createRolePermission.permissionId,
  //   );
  //   const rolePermission = await this.rolePermissionModel.create({
  //     roleId: 3, // hardcoded example role ID
  //     permissionId: 10, // hardcoded example permission ID
  //   });

  //   // const rolePermission = await RolePermission.create({
  //   //   roleId: 1,
  //   //   permissionId: 3,
  //   // });
  //   // const roleId = 5;
  //   // const permissionId = 13;

  //   // const roleId = Number(createRolePermission.roleId);
  //   // const permissionId = Number(createRolePermission.permissionId);

  //   // const query = `
  //   //   INSERT INTO role_permissions (role_id, permission_id)
  //   //   VALUES (:roleId, :permissionId);
  //   // `;

  //   // const [result] = await this.sequelize.query(query, {
  //   //   replacements: { roleId, permissionId },
  //   //   type: QueryTypes.INSERT,
  //   // });

  //   // return result;
  //   return rolePermission;
  // }
  async createRolePermission(createRolePermission: CreateRolePermissionDto) {
    const role = await Role.findByPk(createRolePermission.roleId);
    const permission = await Permission.findByPk(
      createRolePermission.permissionId,
    );
    if (!role || !permission) {
      throw new BadRequestException(
        'selected  Role Or Permission does not Exist',
      );
    }
    const ifExist = await RolePermission.findOne({
      where: {
        roleId: createRolePermission.roleId,
        permissionId: createRolePermission.permissionId,
      },
    });
    if (ifExist) {
      throw new BadRequestException(
        'Request Permission is already have requested role ',
      );
    }
    console.log(createRolePermission);
    console.log('👉 DTO at service:', createRolePermission);
    console.log(
      '👉 roleId:',
      createRolePermission.roleId,
      'permissionId:',
      createRolePermission.permissionId,
    );
    const rolePermission = await RolePermission.create(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      {
        roleId: createRolePermission.roleId,
        permissionId: createRolePermission.permissionId,
        role_id: createRolePermission.roleId,
        permission_id: createRolePermission.permissionId,
      } as any,
      {
        fields: ['roleId', 'permissionId'],
      },
    );
    // const cleanResult = rolePermission.get({ plain: true });

    return rolePermission;
  }

  // async addRolePermissionWithRole(roleId: number, permissionIds: number[]) {
  //   const role = await Role.findByPk(roleId);

  //   const permissions = await Permission.findAll({
  //     where: { id: permissionIds },
  //   });

  //   // Sequelize will upsert them into role_permissions automatically
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  //   await role.addPermissions(permissions);
  // }
  async removeRolePermission(roleId: number, permissionId: number) {
    const rolePermission = await RolePermission.findOne({
      where: { roleId: roleId, permissionId: permissionId },
    });
    if (!rolePermission) {
      throw new NotFoundException('Requested Permission does not exist ');
    }

    await rolePermission.destroy();
    return `Permission of having Id ${permissionId} to assigned to role Having Id ${roleId} is removed`;
  }
}

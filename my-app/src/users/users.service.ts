import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/createUser.dto';
import { CreationAttributes } from 'sequelize/types/model';
import {
  getAllDescendants,
  getAncestryPath,
  isAncestorCTEWithSequelize,
} from 'src/common/utils/getAllDescendants';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Sequelize } from 'sequelize-typescript';
import { reqUser } from 'src/common/interfaces/reqUser.interface';
// This should be a real class/interface representing a user entity
// export type User = any;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly sequelize: Sequelize,
  ) {}
  async create(createUserDto: CreateUserDto, reqUser: reqUser) {
    if (reqUser.roleId === createUserDto.roleId) {
      throw new ForbiddenException(
        "Sorry, you can't create a user with your own role",
      );
    }

    const userRole = await isAncestorCTEWithSequelize(
      this.sequelize,
      'roles',
      reqUser.roleId,
      createUserDto.roleId,
    );

    if (!userRole && reqUser.roleId == createUserDto.roleId) {
      throw new ForbiddenException(
        "You can't assign a role outside your hierarchy",
      );
    }

    if (createUserDto.parentId) {
      const parentRole = await this.userModel.findByPk(createUserDto.parentId);
      if (!parentRole) {
        throw new NotFoundException(
          `Parent User with id ${createUserDto.parentId} not found`,
        );
      }

      // Check if user has permission to use this parent user
      const userCanAssignParent = await isAncestorCTEWithSequelize(
        this.sequelize,
        'users',
        reqUser.userId,
        createUserDto.parentId,
      );

      if (!userCanAssignParent) {
        throw new ForbiddenException(
          "You don't have permission to use this parent as user",
        );
      }
    }

    const newUser = await this.userModel.create({
      name: createUserDto.name,
      password: createUserDto.password,
      roleId: createUserDto.roleId,
      parentId: createUserDto.parentId ?? reqUser.userId,
    } as CreationAttributes<User>);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const savedUser = await this.userModel.findByPk(newUser.id);
    return savedUser;
  }

  async findAll(reqUser: reqUser) {
    const allChildren = await getAllDescendants(User, reqUser.userId);
    return allChildren;
  }

  async findOne(username: string) {
    const user = await User.findOne({ where: { name: username } });
    return user;
  }

  async findOneV2(id: number, reqUser: reqUser) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const creatorParent = await isAncestorCTEWithSequelize(
      this.sequelize,
      'users',
      reqUser.userId,
      id,
    );
    if (!creatorParent) {
      throw new ForbiddenException('You can only see descendants as parents');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto, reqUser: reqUser) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // const userParent = await isAncestor(User, userId, id);
    const hierarchy = await getAncestryPath(this.sequelize, 'users', id);
    const idIndex = hierarchy.indexOf(id);
    const parentIndex = hierarchy.indexOf(user.parentId);
    const requestUserIdIndex = hierarchy.indexOf(reqUser.userId);
    const userParent = requestUserIdIndex < idIndex;
    const userParent2 = requestUserIdIndex < parentIndex;

    // const userParent = await isAncestorCTEWithSequelize(
    //   this.sequelize,
    //   'users',
    //   userId,
    //   id,
    // );
    if (!userParent || !userParent2) {
      throw new ForbiddenException(
        "You don't have permission to modify this user",
      );
    }

    if (updateUserDto.roleId) {
      const userRole = await isAncestorCTEWithSequelize(
        this.sequelize,
        'roles',
        reqUser.roleId,
        updateUserDto.roleId,
      );
      // await isAncestor(
      //   Role,
      //   reqUser.dataValues.roleId,
      //   updateUserDto.roleId ?? 0,
      // );
      if (!userRole) {
        throw new ForbiddenException(
          "You can't assign a role outside your hierarchy",
        );
      }
    }
    if (updateUserDto.parentId) {
      const updateParentIndex = hierarchy.indexOf(updateUserDto.parentId);
      //update user parent is decent of req user
      const userParentDecendent = requestUserIdIndex < updateParentIndex;
      // await isAncestorCTEWithSequelize(
      //   this.sequelize,
      //   'users',
      //   userId,
      //   updateUserDto.parentId,
      // );
      //  await isAncestor(
      //   User,
      //   userId,
      //   updateUserDto.parentId,
      // );
      if (!userParentDecendent) {
        throw new ForbiddenException(
          'You can only assign descendants as parents',
        );
      }
      //check that updated parent is not suceesor of the user
      const userParentAnsector = idIndex < updateParentIndex;
      // await isAncestor(
      //   User,
      //   id,
      //   updateUserDto.parentId,
      // );
      if (userParentAnsector) {
        throw new BadRequestException(
          'Circular parent assignment is not allowed',
        );
      }
    }

    await user.update(updateUserDto);
    return user;
  }

  async remove(id: number, reqUser: reqUser) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const userParent = await isAncestorCTEWithSequelize(
      this.sequelize,
      'users',
      reqUser.userId,
      id,
    );
    if (!userParent) {
      throw new ForbiddenException(
        "You don't have permission to delete this user",
      );
    }
    return `user is  deleted having id:- ${id}`;
  }
}

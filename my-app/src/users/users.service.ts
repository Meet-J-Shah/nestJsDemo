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
  isAncestor,
  isAncestorCTEWithSequelize,
} from 'src/common/utils/getAllDescendants';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Role } from 'src/roles/models/role.model';
import { Sequelize } from 'sequelize-typescript';
// This should be a real class/interface representing a user entity
// export type User = any;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly sequelize: Sequelize,
  ) {}
  async create(createUserDto: CreateUserDto, userId: number) {
    const reqUser = await User.findByPk(userId);

    if (!reqUser) {
      throw new NotFoundException(
        'Requesting user does not exist in the database',
      );
    }

    if (reqUser.dataValues.roleId === createUserDto.roleId) {
      throw new ForbiddenException(
        "Sorry, you can't create a user with your own role",
      );
    }

    const userRole = await isAncestor(
      Role,
      reqUser.dataValues.roleId,
      createUserDto.roleId,
    );

    if (!userRole) {
      throw new ForbiddenException(
        "You can't assign a role outside your hierarchy",
      );
    }

    const createUserData = {
      parentId: userId,
      ...createUserDto,
    };

    const newUser = await this.userModel.create(
      createUserData as unknown as CreationAttributes<User>,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const savedUser = await this.userModel.findByPk(newUser.id);
    return savedUser;
  }

  async findAll(userId: number) {
    const allChildren = await getAllDescendants(User, userId);
    return allChildren;
  }

  async findOne(username: string) {
    const user = await User.findOne({ where: { name: username } });
    return user;
  }

  async findOneV2(id: number, userId: number) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const creatorParent = await isAncestor(User, userId, id);
    if (!creatorParent) {
      throw new ForbiddenException('You can only see descendants as parents');
    }
    const reqUser = await User.findByPk(userId);
    if (!reqUser) {
      throw new NotFoundException(
        'Requesting user does not exist in the database',
      );
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto, userId: number) {
    const reqUser = await User.findOne({ where: { id: userId } });
    if (!reqUser) {
      throw new NotFoundException(
        'Requesting user does not exist in the database',
      );
    }
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    // const userParent = await isAncestor(User, userId, id);
    const res = await getAncestryPath(this.sequelize, 'users', id);
    console.log(res);
    const userParent = await isAncestorCTEWithSequelize(
      this.sequelize,
      'users',
      userId,
      id,
    );
    if (!userParent) {
      throw new ForbiddenException(
        "You don't have permission to modify this user",
      );
    }

    if (updateUserDto.roleId) {
      const userRole = await isAncestorCTEWithSequelize(
        this.sequelize,
        'roles',
        reqUser.dataValues.roleId,
        updateUserDto.roleId ?? 0,
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
      //update user parent is decent of req user
      const userParentDecendent = await isAncestorCTEWithSequelize(
        this.sequelize,
        'users',
        userId,
        updateUserDto.parentId,
      );
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
      const userParentAnsector = await isAncestor(
        User,
        id,
        updateUserDto.parentId,
      );
      if (userParentAnsector) {
        throw new BadRequestException(
          'Circular parent assignment is not allowed',
        );
      }
    }

    await user.update(updateUserDto);
    return user;
  }

  async remove(id: number, userId: number) {
    const reqUser = await User.findOne({ where: { id: userId } });
    if (!reqUser) {
      throw new NotFoundException(
        'Requesting user does not exist in the database',
      );
    }
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const userParent = await isAncestor(User, userId, id);
    if (!userParent) {
      throw new ForbiddenException(
        "You don't have permission to delete this user",
      );
    }
    return `user is  deleted having id:- ${id}`;
  }
}

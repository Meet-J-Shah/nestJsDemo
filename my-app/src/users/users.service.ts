import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/createUser.dto';
import { CreationAttributes } from 'sequelize/types/model';
import {
  getAllDescendants,
  isAncestor,
} from 'src/common/utils/getAllDescendants';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Role } from 'src/roles/models/role.model';
// This should be a real class/interface representing a user entity
// export type User = any;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}
  async create(createUserDto: CreateUserDto, userId: number) {
    const user = await User.findByPk(userId);
    const reqUser = await User.findOne({ where: { id: userId } });
    if (!reqUser) {
      return 'You are not exisitng in db';
    }
    if (reqUser.dataValues.roleId == createUserDto.roleId) {
      return "Sorry,you can't create user of your role";
    }
    const userRole = await isAncestor(
      Role,
      reqUser.dataValues.roleId,
      createUserDto.roleId,
    );
    if (!userRole) {
      return "You can't modify It";
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const createUserData = { parentId: user?.id, ...createUserDto };
    const newUser = await this.userModel.create(
      createUserData as unknown as CreationAttributes<User>,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const bk = await this.userModel.findByPk(newUser?.id);
    return bk;
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
      return 'Not Found Error';
    }
    const creatorParent = await isAncestor(User, userId, id);
    if (!creatorParent) {
      return "You can't see It cause it is not your descendent";
    }
    const reqUser = await User.findByPk(userId);
    if (!reqUser) {
      return 'You are not exisitng in db';
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto, userId: number) {
    const reqUser = await User.findOne({ where: { id: userId } });
    if (!reqUser) {
      return 'You are not exisitng in db';
    }
    const user = await User.findByPk(id);
    if (!user) {
      return 'User not found';
    }
    const userParent = await isAncestor(User, userId, id);
    if (!userParent) {
      return "You can't modify It";
    }

    if (updateUserDto.roleId) {
      const userRole = await isAncestor(
        Role,
        reqUser.dataValues.roleId,
        updateUserDto.roleId ?? 0,
      );
      if (!userRole) {
        return "You can't modify It";
      }
    }
    if (updateUserDto.parentId) {
      //update user parent is decent of req user
      const userParentDecendent = await isAncestor(
        User,
        userId,
        updateUserDto.parentId,
      );
      if (!userParentDecendent) {
        return "You can't modify It";
      }
      //check that updated parent is not suceesor of the user
      const userParentAnsector = await isAncestor(
        User,
        id,
        updateUserDto.parentId,
      );
      if (userParentAnsector) {
        return "You can't modify It";
      }
    }

    await user.update(updateUserDto);
    return user;
  }

  async remove(id: number, userId: number) {
    const reqUser = await User.findOne({ where: { id: userId } });
    if (!reqUser) {
      return 'You are not exisitng in db';
    }
    const user = await User.findByPk(id);
    if (!user) {
      return 'User not found';
    }
    const userParent = await isAncestor(User, userId, id);
    if (!userParent) {
      return "You can't delete It";
    }
    return `user is  deleted having id:- ${id}`;
  }
}

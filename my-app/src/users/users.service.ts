import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/createUser.dto';
import { CreationAttributes } from 'sequelize/types/model';
// This should be a real class/interface representing a user entity
// export type User = any;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}
  async create(createUserDto: CreateUserDto, userId: number) {
    console.log(createUserDto, userId);
    const user = await User.findByPk(userId);
    const rId = user?.dataValues.roleId ?? Infinity;
    if (rId > createUserDto.roleId) {
      return 0;
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

  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async findAll(userId: number) {
    async function getAllDescendants(
      userId: number,
      result: User[] = [],
    ): Promise<User[]> {
      const children = await User.findAll({
        where: { parentId: userId },
      });

      for (const child of children) {
        result.push(child);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await getAllDescendants(child.dataValues.id, result);
      }

      return result;
    }
    const allChildren = await getAllDescendants(userId);
    return allChildren;
  }

  async findOne(username: string) {
    const user = await User.findOne({ where: { name: username } });
    return user;
  }
}

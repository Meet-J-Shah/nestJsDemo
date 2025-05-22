import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';

// This should be a real class/interface representing a user entity
// export type User = any;

@Injectable()
export class UsersService {
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

  async findOne(username: string) {
    const user = await User.findOne({ where: { name: username } });
    return user;
  }
}

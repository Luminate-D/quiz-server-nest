import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  public async getUserByLogin(login: string): Promise<User | null> {
    return this.users.findOne({ where: { login } });
  }

  public async createUser(login: string, password: string) {
    const user = new User();
    user.login = login;
    user.password = password;
    user.token = 'Token-' + Math.random().toString(36).substring(2);

    return await this.users.save(user);
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers['authorization'] ?? 'invalid';

    // 'Bearer ' - 7 length
    const user = await this.users.findOneBy({
      token: auth.slice(7) ?? 'invalid',
    });
    if (!user) throw new UnauthorizedException('Invalid token');

    return true;
  }
}

import {
  Body,
  Controller,
  Inject,
  LoggerService,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('LoggerService') private logger: LoggerService,
    private authService: AuthService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDTO) {
    const user = await this.authService.getUserByLogin(dto.login);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // TODO: password hashing
    if (user.password == dto.password) {
      return { token: user.token };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  @Post('register')
  async register(@Body() dto: RegisterDTO) {
    if ((await this.authService.getUserByLogin(dto.login)) != null) {
      throw new UnauthorizedException('Login taken');
    }

    // TODO: password hashing
    this.logger.log('Registering user', dto.login, dto.password);
    return await this.authService.createUser(dto.login, dto.password);
  }
}

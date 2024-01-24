import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { comparePasswords, hashPassword } from 'src/common/passwrod-bcrypt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async signup(firstName: string, email: string, password: string) {
    const users = await this.usersService.find(email);
    if (users.length) throw new BadRequestException('Email in use');
    const hashedPassword = await hashPassword(password);
    const user = await this.usersService.create(
      firstName,
      email,
      hashedPassword,
    );
    return user;
  }
  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) throw new NotFoundException('user not found');
    const match = await comparePasswords(password, user.password);
    if (!match) throw new BadRequestException('Incorrect password');
    const tokens = await this.usersService.getTokens(user.id, user.email);
    return {
      ...user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}

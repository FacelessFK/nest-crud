import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './schema/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async create(firstName: string, email: string, password: string) {
    const user = this.userRepo.create({
      firstName,
      email,
      password,
    });

    const { accessToken, refreshToken } = await this.getTokens(
      user.id,
      user.email,
    );

    const newUser = await this.userRepo.save({ ...user, refreshToken });
    return {
      firstName: newUser.firstName,
      email: newUser.email,
      accessToken,
    };
  }

  findOne(id: string) {
    return this.userRepo.findOneBy({ id: id });
  }

  find(email: string) {
    return this.userRepo.findBy({ email: email });
  }

  async update(id: string, attrs: Partial<User>) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    const tokens = await this.getTokens(user.id, user.email);
    // Update the refresh token directly
    Object.assign(user, { ...attrs, refreshToken: tokens.refreshToken });
    return this.userRepo.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return this.userRepo.remove(user);
  }
  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '2h',
        },
      ),
      this.jwtService.signAsync(
        {
          id: userId,
          email,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }
}

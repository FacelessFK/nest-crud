import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './schema/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { hashPassword } from 'src/common/hash-password';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async create(firstName: string, email: string, password: string) {
    const hashedPassword = await hashPassword(password);
    const user = this.userRepo.create({
      firstName,
      email,
      password: hashedPassword,
    });
    return this.userRepo.save(user);
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
    Object.assign(user, attrs);
    return this.userRepo.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return this.userRepo.remove(user);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from 'src/common/passwrod-bcrypt';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dto/user.dto';
import { AuthService } from './auth.service';
import { SigninUserDto } from './dto/signin-user.dto';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';

@Controller('auth')
@Serialize(UserDto) // remove password from response
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}
  @Post('/signup')
  createUser(@Body() body: CreateUserDto) {
    return this.authService.signup(body.firstName, body.email, body.password);
  }

  @Post('/signin')
  signin(@Body() body: SigninUserDto) {
    return this.authService.signin(body.email, body.password);
  }

  //   @UseInterceptors(new SerializeInterceptor(UserDto)) // remove password from response
  @UseGuards(AccessTokenGuard)
  @Get('/me')
  findUser(@GetCurrentUser('id') id: string) {
    const user = this.usersService.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }
  @UseGuards(AccessTokenGuard)
  @Delete()
  removeUser(@GetCurrentUser('id') id: string) {
    return this.usersService.remove(id);
  }
  @UseGuards(AccessTokenGuard)
  @Patch('')
  async updateUser(
    @GetCurrentUser('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    const { password } = body;

    const hashedPassword = await hashPassword(password);
    return this.usersService.update(id, { ...body, password: hashedPassword });
  }
}

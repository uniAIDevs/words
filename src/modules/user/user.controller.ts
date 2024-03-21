import { Controller, Get, Put, Delete, Body, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserModel } from './user.model';
import { UpdateUserDto } from './update-user.dto';

@ApiBearerAuth('BearerAuth')
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getUserById(@Req() req): Promise<UserModel> {
    return this.userService.getUserById(req.user.userId);
  }

  @Put('me')
  async updateUser(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserModel> {
    return this.userService.updateUser(req.user.userId, updateUserDto);
  }

  @Delete('me')
  async deleteUser(@Req() req): Promise<UserModel> {
    return this.userService.deleteUser(req.user.userId);
  }
}

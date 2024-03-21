import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, UpdateQuery } from 'mongoose';
import { convertArrayToObject } from 'src/shared/utils/common';
import { UserModel } from './user.model';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel.name)
    private userModel: Model<UserModel>
  ) {}

  async getAllUsers(): Promise<UserModel[]> {
    return this.userModel.find();
  }

  async getUserById(
    id: string,
    projection?: ProjectionType<UserModel>,
  ): Promise<UserModel> {
    const user = await this.userModel.findById(id, projection);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserModel> {
    const user = new this.userModel({
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
      emailVerified: false,
    });
    return await user.save();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserModel> {
    try {
      // Find the user by ID
      const user = await this.userModel.findById(id).exec();

      if (!user) {
        throw new NotFoundException(`${this.userModel.modelName} not found`);
      }

      // Apply partial updates
      const update: UpdateQuery<UserModel> = {};
      for (const field in updateUserDto) {
        if (updateUserDto.hasOwnProperty(field)) {
          update[field] = updateUserDto[field];
        }
      }

      // Save the updated document
      user.set(update);
      return user.save();
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  async deleteUser(id: string): Promise<UserModel> {
    return this.userModel.findByIdAndRemove(id).exec();
  }

  async getUserByEmail(email: string, checkForExists: boolean = true) {
    const user = await this.userModel.findOne(
      { email },
      { id: 1, email: 1, password: 1, emailVerified: 1 },
    );
    if (!user && checkForExists) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async changePassword(email: string, password: string) {
    const user = await this.getUserByEmail(email);
    user.password = password;
    await user.save();
  }

  async verifyUser(email: string) {
    const user = await this.getUserByEmail(email);
    user.emailVerified = true;
    await user.save();
  }
}

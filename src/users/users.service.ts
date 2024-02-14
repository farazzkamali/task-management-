import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from 'src/iam/hashing/hashing.service';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly hashingService: HashingService,
    ){}

  async findAll(): Promise<User[]> {
    try {
      const users = await this.users.find()
      if (users.length === 0) {
        throw new NotFoundException('Users not found');
    }
      return users;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new Error('An error occurred while finding the users')
    }

  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.users.findOne({where:{id:id}, relations:['task']})
      if (!user) {
        throw new NotFoundException('User not found')
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new Error('An error occurred while finding the user');
      }
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.findOne(id);
      if (updateUserDto.email) {
        if (updateUserDto.email === user.email) {
          throw new BadRequestException('Provided email is same as the current one')
        }
        user.email = updateUserDto.email
      }
      if (updateUserDto.password) {
        user.password = await this.hashingService.hash(updateUserDto.password)
      }
      const updatedUser: User = await this.users.save(user)
      return updatedUser;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new Error('An error occurred while finding the user');
      }
    }

  }

  async remove(id: number): Promise<void> {
    try {
      const user = await this.users.findOne({where:{id:id}})
      if (!user) {
        throw new NotFoundException('User not found')
      }
      await this.users.remove(user)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new Error('An error occurred while removing the user')
    }
  }
}

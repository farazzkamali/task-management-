import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/tasks/entities/task.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HashingService } from 'src/iam/hashing/hashing.service';
import { BcryptService } from 'src/iam/hashing/bcrypt.service';

@Module({
  imports:[TypeOrmModule.forFeature([Task, User])],
  controllers: [UsersController],
  providers: [UsersService,
    {
    provide: HashingService,
    useClass: BcryptService
    }
]
})
export class UsersModule {}

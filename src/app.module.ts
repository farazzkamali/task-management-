import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {ConfigModule} from '@nestjs/config'
import { User } from './users/entities/user.entity';
import { Task } from './tasks/entities/task.entity';
import { IamModule } from './iam/iam.module';
import { CommonModule } from './common/common.module';
import { GatewayModule } from './gateway/gateway.module';


@Module({
  imports: [UsersModule, TasksModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false,
    entities: [User, Task],
    synchronize:true
  }),
    IamModule,
    CommonModule, 
    GatewayModule
  ],

})
export class AppModule {}

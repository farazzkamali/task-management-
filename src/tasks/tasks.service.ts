import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasks:Repository<Task>,
    @InjectRepository(User) private readonly users:Repository<User>
  ){}
  async create(createTaskDto: CreateTaskDto, userId:number): Promise<Task> {
    try {

      const taskExists = await this.tasks.findOne({where:{title:createTaskDto.title}})

      if (taskExists){
        console.log(taskExists)
        throw new BadRequestException('This task already exists')
        
      }

      const task = this.tasks.create(createTaskDto)
      const creator = await this.users.findOne({where:{id:userId}})
      task.creator = creator
      this.users.save(task)
      await this.tasks.save(task)
      
      
      return task;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new Error('Error while creating task')
      
    }

  }

  async findAll(): Promise<Task[]> {
    try {
      const tasks = await this.tasks.find({relations:['creator']})
      return tasks;      
    } catch (error) {
      throw new Error("Error while finding users")
    }

  }

  async findOne(id: number): Promise<Task>{
    try {
      const task = await this.tasks.findOne({where:{id:id}, relations:['creator']})
      if (!task) {
        throw new NotFoundException('Task not found')
      }
      return task
    }catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new Error('Error finding the task')
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task>{
    try {
      const task = await this.findOne(id)
      if (!task) {
        throw new NotFoundException('Task not found')
      }
      task.title = updateTaskDto.title
      task.body = updateTaskDto.body
      const updatedTask = await this.tasks.save(task)
  
      return updatedTask;
    } catch (error) {
      if (error instanceof NotFoundException) {
       throw error 
      }
      throw new Error("Error while updating the task")
    }

  }

  async remove(id: number): Promise<void> {
    try {
      const task = await this.findOne(id)
      await this.tasks.remove(task)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new Error('Error while removing the task')
    }
  }
}

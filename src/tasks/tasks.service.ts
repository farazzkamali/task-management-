import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { TimeoutError } from 'rxjs';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private readonly tasks:Repository<Task>){}
  async create(createTaskDto: CreateTaskDto) {
    try {
      const task = await this.tasks.save(this.tasks.create(createTaskDto))
      return `This action adds a new task ${task.title}`;
    } catch (error) {
      if (error instanceof BadRequestException){
        throw new BadRequestException(error)
      }
      
    }

  }

  async findAll() {
    const tasks = await this.tasks.find()
    return tasks;
  }

  async findOne(id: number) {
    try {
      const task = await this.tasks.findOne({where:{id:id}})
      if (!task) {
        throw new NotFoundException("Task not found")
      }
      return task 
    }catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }else{
        throw new HttpException('Error finding the task', HttpStatus.INTERNAL_SERVER_ERROR)
      }
    
    }

  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id)
    task.title = updateTaskDto.title
    task.body = updateTaskDto.body
    const updatedTask = await this.tasks.save(task)

    return `This action updates a #${id} task ${updatedTask.body} ${updatedTask.title}`;
  }

  async remove(id: number) {
    const task = await this.findOne(id)
    await this.tasks.remove(task)
    return `This action removes a #${id} task`;
  }
}

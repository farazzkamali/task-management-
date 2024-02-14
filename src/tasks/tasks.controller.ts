import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Request } from '@nestjs/common';
import { Roles } from '../iam/authorization/decorators/roles.decorator';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { Role } from '../users/enums/role.enum';
import { ApiForbiddenResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthType } from '../iam/enums/auth-type.enum';
import { Auth } from '../iam/authentication/decorators/auth.decorator';

@Auth(AuthType.Bearer)
@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiForbiddenResponse({description:'Forbidden'})
  @ApiUnauthorizedResponse({description:'Unauthorized'})
  @Roles(Role.Admin)
  @HttpCode(201)
  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
      const userId = req.user.sub
      return this.tasksService.create(createTaskDto, userId);
  }

  @ApiUnauthorizedResponse({description:'Unauthorized'})
  @Get()
  findAll(@ActiveUser() user:ActiveUserData) {
    return this.tasksService.findAll();
  }

  @ApiUnauthorizedResponse({description:'Unauthorized'})
  @Get(':id')
  findOne(@Param('id') id: string) {
      return this.tasksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}

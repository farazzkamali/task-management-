// create-task.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateTaskDto {
  @ApiProperty({description:'The title of task'})
  @IsNotEmpty()
  @IsString()
  title: string;


  @ApiProperty({description:'the tasks description'})
  @IsNotEmpty({message:"custom message"})
  @IsString()
  body: string;

}

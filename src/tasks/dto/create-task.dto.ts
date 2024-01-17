// create-task.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty({message:"custom message"})
  @IsString()
  body: string;
}

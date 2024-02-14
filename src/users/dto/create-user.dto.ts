import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    @ApiProperty({description:'email'})
    @IsNotEmpty({message:"custom message"})
    @IsEmail()
    email: string;

    @ApiProperty({description:'password'})
    @IsNotEmpty({message:"custom message"})
    @IsString()
    password: string
}

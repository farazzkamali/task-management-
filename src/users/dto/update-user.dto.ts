import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {

    @ApiProperty({description:'email'})
    @IsNotEmpty({message:"custom message"})
    @IsEmail()
    email?:string

    @ApiProperty({description:'password'})
    @IsOptional()
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {message: 'Password too weak'})
    password?:string
}

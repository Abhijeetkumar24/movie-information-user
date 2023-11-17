import { IsString, IsEmail, IsArray, } from 'class-validator';

export class CreateUserDto {

@IsString()
name: string;

@IsEmail()
email: string;

@IsString()
password: string;

@IsArray()
role: [string];

@IsString()
notification: string

}
import { IsString, IsEmail, } from 'class-validator';

export class SignupVerificationDto {

    @IsString()
    otp: string;

}
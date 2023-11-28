import { IsString, } from 'class-validator';

export class SignupVerificationDto {

    @IsString()
    otp: string;

}
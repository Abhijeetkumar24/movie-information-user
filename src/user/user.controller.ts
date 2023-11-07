import { Body, Controller, Get, Inject, OnModuleInit, Param, Post, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { UserService } from './user.service';
import { Response } from 'express';
import { SignupVerificationDto } from './dto/signup.verify.dto';
import { LoginDto } from './dto/login.dto';
import { responseUtils } from 'src/utils/response.utils';
import { ExceptionMessage, HttpStatusMessage, SuccessMessage } from 'src/interface/enum';


@Controller('user')
export class UserController {

    constructor(
        private userService: UserService,

    ) { }


    @Get('hero')
    async Hero() {
        return this.userService.getHero();
    }

    @Post('user-signup')
    async userSignup(@Body() createUserDto: CreateUserDto, @Res() res: Response,) {
        try {
            const response = await this.userService.userSignup(createUserDto);
            let finalResponse = responseUtils.successResponse(
                response,
                // SuccessMessage.USER_REGISTRATION_MAIL,
                HttpStatusMessage.OK
            )
            res.status(finalResponse.code).send(finalResponse);
        } catch (error) {
            let err = responseUtils.errorResponse(
                error,
                ExceptionMessage.ERROR_IN_REGISTRATION,
            );
            res.status(err.code).send(err);
        }

    }


    @Post('user-signup-verification')
    async userSignupVerification(@Body() signupVerificationDto: SignupVerificationDto, @Res() res: Response,) {
        try {
            const response = await this.userService.userSignupVerification(signupVerificationDto);
            let finalResponse = responseUtils.successResponse(
                response,
                SuccessMessage.USER_SIGNUP_SUCCESS,
                HttpStatusMessage.CREATED
            )
            res.status(finalResponse.code).send(finalResponse);
        } catch (error) {
            let err = responseUtils.errorResponse(
                error,
                ExceptionMessage.ERROR_IN_REGISTRATION,
            );
            res.status(err.code).send(err);
        }
    }

    @Post('user-login')
    userLogin(@Body() userLoginDto: LoginDto, @Res() res: Response) {
        try {
            const { email, password ,deviceId } = userLoginDto;
            const observable = this.userService.userLogin(email, password, deviceId)
            observable.subscribe((response) => {
                console.log(response)
                let finalResponse = responseUtils.successResponse(
                    response['token'],
                    response['message'],
                    response['status']
                )
                res.status(finalResponse.code).send(finalResponse);

            })
        }catch(error){
            let err = responseUtils.errorResponse(
                error,
                ExceptionMessage.LOGIN_FAILED,
            );
            res.status(err.code).send(err);
        }
       

    }


}

import { Body, Controller, Get, Inject, OnModuleInit, Param, Post, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { UserService } from './user.service';
import { Response } from 'express';
import { SignupVerificationDto } from './dto/signup.verify.dto';
import { LoginDto } from './dto/login.dto';
import { responseUtils } from 'src/utils/response.utils';
import { ExceptionMessage, HttpStatusMessage, SuccessMessage } from 'src/interface/enum';
import { ClientProxy, ClientProxyFactory, GrpcMethod, Transport } from '@nestjs/microservices';
import { NameEmailRequest, NameEmailResponse, SubscriberRequest, subscriberResponse } from 'src/interface/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { Observable, lastValueFrom, scan, take } from 'rxjs';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';


@ApiTags('User')
@Controller('user')
export class UserController {

    constructor(
        private userService: UserService,
        @InjectModel(User.name) private UserModel: Model<User>,
    ) { }


    @Post('signup')
    @ApiOperation({
        summary: 'User Signup',
        description: 'Register a new user with the provided details.',
    })
    async userSignup(@Body() createUserDto: CreateUserDto, @Res() res: Response,) {
        try {
            const observable = await this.userService.userSignup(createUserDto);

            observable.subscribe((response) => {
                let finalResponse = responseUtils.successResponse(
                    response['message'],
                    response['message'],
                    response['status']
                )
                res.status(finalResponse.code).send(finalResponse);
            })

        } catch (error) {
            let err = responseUtils.errorResponse(
                error,
                ExceptionMessage.ERROR_IN_REGISTRATION,
            );
            res.status(err.code).send(err);
        }

    }


    @Post('signup-verification')
    @ApiOperation({
        summary: 'User Signup Verification',
        description: 'Verify user signup with the provided OTP.',
    })
    async userSignupVerification(@Body() signupVerificationDto: SignupVerificationDto, @Res() res: Response,) {
        try {
            const observable = await this.userService.userSignupVerification(signupVerificationDto);

            observable.subscribe((response) => {
                let finalResponse = responseUtils.successResponse(
                    response['message'],
                    response['message'],
                    response['status']
                )
                res.status(finalResponse.code).send(finalResponse);
            })

        } catch (error) {
            let err = responseUtils.errorResponse(
                error,
                ExceptionMessage.ERROR_IN_REGISTRATION,
            );
            res.status(err.code).send(err);
        }
    }


    @Post('login')
    @ApiOperation({
        summary: 'User Login',
        description: 'Authenticate user with the provided login credentials.',
    })
    userLogin(@Body() userLoginDto: LoginDto, @Res() res: Response) {
        try {
            const { email, password, deviceId } = userLoginDto;
            const observable = this.userService.userLogin(email, password, deviceId)
            observable.subscribe((response) => {
                let finalResponse = responseUtils.successResponse(
                    response['token'],
                    response['message'],
                    response['status']
                )
                res.status(finalResponse.code).send(finalResponse);
            })
        } catch (error) {
            let err = responseUtils.errorResponse(
                error,
                ExceptionMessage.LOGIN_FAILED,
            );
            res.status(err.code).send(err);
        }


    }


    @GrpcMethod('UserService', 'GetSubscriber')
    async subscribers(payload: SubscriberRequest): Promise<subscriberResponse> {
        try {
            if (payload.request == true) {
                const usersWithNotificationYes = await this.UserModel.find({ notification: 'yes' }).exec();
                return { emails: usersWithNotificationYes.map((user) => user.email) };
            }

        } catch (error) {
            throw error;
        }
    }


    @GrpcMethod('UserService', 'GetNameEmail')
    async getName(payload: NameEmailRequest): Promise<NameEmailResponse> {
        try {
            const user = await this.UserModel.findById(payload.id);
            return { name: user.name, email: user.email };

        } catch (error) {
            throw error;
        }
    }



}

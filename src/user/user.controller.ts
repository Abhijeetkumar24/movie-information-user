import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { SignupVerificationDto } from './dto/signup.verify.dto';
import { LoginDto } from './dto/login.dto';
import { responseUtils } from 'src/utils/response.utils';
import { ExceptionMessage, } from 'src/interface/enum';
import { GrpcMethod } from '@nestjs/microservices';
import { NameEmailRequest, NameEmailResponse, SubscriberRequest, subscriberResponse } from 'src/interface/user.interface';
import { lastValueFrom,} from 'rxjs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';


@ApiTags('User')
@Controller('user')
export class UserController {

    constructor(
        private userService: UserService,
    ) { }


   /**
   * Handles user signup functionality.
   *
   * @route POST /signup
   * @summary User Signup
   * @description Registers a new user with the provided details.
   * @param {CreateUserDto} createUserDto - The data for creating a new user.
   * @param {Response} res - The HTTP response object for sending the result.
   * @returns {Promise<void>} A Promise that resolves when the signup process is complete.
   */  
    @Post('signup')
    @ApiOperation({
        summary: 'User Signup',
        description: 'Register a new user with the provided details.',
    })
    async userSignup(@Body() createUserDto: CreateUserDto, @Res() res: Response):Promise<void> {
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


    /**
    * Handles user signup verification functionality.
    *
    * @route POST /signup-verification
    * @summary User Signup Verification
    * @description Verifies user signup with the provided OTP.
    * @param {SignupVerificationDto} signupVerificationDto - The data for verifying user signup.
    * @param {Response} res - The HTTP response object for sending the result.
    * @returns {Promise<void>} A Promise that resolves when the signup verification process is complete.
    */
    @Post('signup-verification')
    @ApiOperation({
        summary: 'User Signup Verification',
        description: 'Verify user signup with the provided OTP.',
    })
    async userSignupVerification(@Body() signupVerificationDto: SignupVerificationDto, @Res() res: Response,): Promise<void> {
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



    /**
     * Handles user login functionality.
     *
     * @route POST /login
     * @summary User Login
     * @description Authenticates user with the provided login credentials.
     * @param {LoginDto} userLoginDto - The data containing user login credentials.
     * @param {Response} res - The HTTP response object for sending the result.
     * @returns {Promise<void>} A Promise that resolves when the login process is complete.
     */
    @Post('login')
    @ApiOperation({
        summary: 'User Login',
        description: 'Authenticate user with the provided login credentials.',
    })
    async userLogin(@Body() userLoginDto: LoginDto, @Res() res: Response): Promise<void>  {
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


    /**
     * Handles user logout functionality.
     *
     * @route POST /logout
     * @summary User Logout
     * @description Logs out the user.
     * @param {Request} req - The HTTP request object containing user information.
     * @param {Response} res - The HTTP response object for sending the result.
     * @returns {Promise<void>} A Promise that resolves when the logout process is complete.
     */
    @Post('logout')
    @ApiOperation({
        summary: 'User Logout',
        description: 'Logout the user.',
    })
    async userLogout(@Req() req: Request, @Res() res: Response): Promise<void> {
        try {

            const payload = req.headers.authorization;
            const observable = this.userService.logout(payload)
            const response = await lastValueFrom(observable);
            let finalResponse = responseUtils.successResponse(
                response['message'],
                response['message'],
                response['status']
            )
            res.status(finalResponse.code).send(finalResponse);

        } catch (error) {
            let err = responseUtils.errorResponse(
                error,
                ExceptionMessage.LOGOUT_FAIL,
            );
            res.status(err.code).send(err);
        }


    }



    /**
    * Handles the gRPC method for retrieving subscribers.
    *
    * @param {SubscriberRequest} payload - The request payload for retrieving subscribers.
    * @returns {Promise<subscriberResponse>} A Promise that resolves with the response containing subscribers.
    */
    @GrpcMethod('UserService', 'GetSubscriber')
    async getSubscribers(payload: SubscriberRequest): Promise<subscriberResponse> {
        return this.userService.getSubscribers(payload);
    }

    

   /**
    * Handles the gRPC method for retrieving user names and emails.
    *
    * @param {NameEmailRequest} payload - The request payload containing Id for retrieving user names and emails.
    * @returns {Promise<NameEmailResponse>} A Promise that resolves with the response containing user names and emails.
    */
    @GrpcMethod('UserService', 'GetNameEmail')
    async getNameEmail(payload: NameEmailRequest): Promise<NameEmailResponse> {
        return this.userService.getNameEmail(payload);
    }


}

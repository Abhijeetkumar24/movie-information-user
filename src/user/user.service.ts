import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { SignupVerificationDto } from './dto/signup.verify.dto';
import { Observable } from 'rxjs';
import { ClientGrpc, } from '@nestjs/microservices';
import { AuthService, SubscriberRequest, subscriberResponse } from 'src/interface/auth.interface';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { NameEmailRequest, NameEmailResponse } from 'src/interface/user.interface';




@Injectable()
export class UserService implements OnModuleInit {
   
    private authService: AuthService;


    constructor(
        @Inject('AUTH_PACKAGE') private AuthClient: ClientGrpc,
        @InjectModel(User.name) private UserModel: Model<User>,

    ) { }

    onModuleInit() {
        this.authService = this.AuthClient.getService<AuthService>('AuthService');

    }


    /**
    * Handles user signup functionality.
    *
    * @param {CreateUserDto} createUserDto - The data for creating a new user.
    * @returns {Promise<any>} A Promise that resolves with the result of the user signup process.
    */
    async userSignup(createUserDto: CreateUserDto): Promise<any> {

        const { name, email, password, role, notification } = createUserDto
        return this.authService.signup({ name, email, password, role, notification })

    }


    /**
    * Handles user signup verification functionality.
    *
    * @param {SignupVerificationDto} signupVerificationDto - The data for verifying user signup.
    * @returns {Promise<any>} A Promise that resolves with the result of the user signup verification process.
    */
    async userSignupVerification(signupVerificationDto: SignupVerificationDto): Promise<any> {

        const { otp } = signupVerificationDto
        return this.authService.signupVerification({ otp });

    }


    /**
    * Handles user login functionality.
    *
    * @param {string} email - The email address of the user.
    * @param {string} password - The password for user authentication.
    * @param {string} deviceId - The unique identifier for the user's device.
    * @returns {Observable<string>} An Observable that emits the authentication token.
    */
    userLogin(email: string, password: string, deviceId: string): Observable<string> {
        return this.authService.getToken({ email, password, deviceId })
    }

    /**
    * Handles user logout functionality.
    *
    * @param {string} token - The authentication token associated with the user session.
    * @returns {Observable<string>} An Observable that emits the result of the user logout process.
    */
    logout(token: string): Observable<string>{
        return this.authService.logout({ token })
    }


    /**
    * Retrieves subscribers based on the provided payload.
    *
    * @param {SubscriberRequest} payload - The request payload for retrieving subscribers.
    * @returns {Promise<subscriberResponse>} A Promise that resolves with the response containing subscriber emails.
    */
    async getSubscribers(payload: SubscriberRequest): Promise<subscriberResponse> {
        try {
            if (payload.request) {
                const usersWithNotificationYes = await this.UserModel.find({ notification: 'yes' }).exec();
                return { emails: usersWithNotificationYes.map((user) => user.email) };
            }
        } catch (error) {
            throw error;
        }
    }


    /**
    * Retrieves user name and email based on the provided user ID.
    *
    * @param {NameEmailRequest} payload - The request payload containing the user ID.
    * @returns {Promise<NameEmailResponse>} A Promise that resolves with the response containing user name and email.
    */
    public async getNameEmail(payload: NameEmailRequest): Promise<NameEmailResponse> {
        try {
            const user = await this.UserModel.findById(payload.id);
            return { name: user.name, email: user.email };
        } catch (error) {
            throw error;
        }
    }



}

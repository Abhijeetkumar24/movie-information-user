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


    async userSignup(createUserDto: CreateUserDto): Promise<any> {

        const { name, email, password, role, notification } = createUserDto
        return this.authService.signup({ name, email, password, role, notification })

    }

    async userSignupVerification(signupVerificationDto: SignupVerificationDto): Promise<any> {

        const { otp } = signupVerificationDto
        return this.authService.signupVerification({ otp });

    }


    userLogin(email: string, password: string, deviceId: string): Observable<string> {
        return this.authService.getToken({ email, password, deviceId })
    }

    logout(token: string): Observable<string>{
        return this.authService.logout({ token })
    }


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


    public async getNameEmail(payload: NameEmailRequest): Promise<NameEmailResponse> {
        try {
            const user = await this.UserModel.findById(payload.id);
            return { name: user.name, email: user.email };
        } catch (error) {
            throw error;
        }
    }



}

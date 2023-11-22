import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { SignupVerificationDto } from './dto/signup.verify.dto';
import { Observable } from 'rxjs';
import { Client, ClientGrpc,  } from '@nestjs/microservices';
// import { HeroesService } from 'src/interface/hero.interface';
import { AuthService } from 'src/interface/auth.interface';




@Injectable()
export class UserService implements OnModuleInit {

    private authService: AuthService;


    constructor(
        @Inject('AUTH_PACKAGE') private AuthClient: ClientGrpc,
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

}

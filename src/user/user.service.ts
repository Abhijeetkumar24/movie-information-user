import { ConflictException, HttpException, HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create.user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { response } from 'express';
import { MailerService } from '@nestjs-modules/mailer';
import { ExceptionMessage, HttpStatusMessage, MSG, SuccessMessage } from 'src/interface/enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SignupVerificationDto } from './dto/signup.verify.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
// import { HeroesService } from 'src/interface/hero.interface';
import { AuthService } from 'src/interface/auth.interface';
import { CustomException } from 'src/utils/exception.utils';



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

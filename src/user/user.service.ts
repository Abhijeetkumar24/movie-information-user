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
import { HeroesService } from 'src/interface/hero.interface';
import { AuthService } from 'src/interface/auth.interface';
import { CustomException } from 'src/utils/exception.utils';



@Injectable()
export class UserService implements OnModuleInit{

    private heroesService: HeroesService;
    private authService: AuthService;


    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        private readonly mailerService: MailerService,
        private jwtService: JwtService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        // @Inject(['HERO_PACKAGE','AUTH_PACKAGE']) private client: ClientGrpc,
        @Inject('HERO_PACKAGE') private heroClient: ClientGrpc,
        @Inject('AUTH_PACKAGE') private AuthClient: ClientGrpc,



    ) { }

    onModuleInit() {
        this.heroesService = this.heroClient.getService<HeroesService>('HeroesService');
        this.authService = this.AuthClient.getService<AuthService>('AuthService');

    }

    getHero(): Observable<string> {
        return this.heroesService.findOne({ id: 2 });
    }


    async userSignup(createUserDto: CreateUserDto): Promise<any> {
        try {

            const existingUser = await this.UserModel.findOne({ email: createUserDto.email })
            if (existingUser) {
                throw new CustomException(ExceptionMessage.USER_ALREADY_EXIST, HttpStatusMessage.CONFLICT).getError();
            }

            const OTP = Math.floor(1000 + Math.random() * 9000);

            await this.cacheManager.set(`${OTP}`, createUserDto.email, 300000)

            await this.cacheManager.set(
                `${createUserDto.email}+${OTP}`,
                createUserDto,
                300000
            );

            const mailOptions = {
                to: createUserDto.email,
                subject: MSG.VERIFICATION_OTP,
                text: MSG.USER_REGISTER + OTP,
            };

            await this.mailerService.sendMail(mailOptions);

            return SuccessMessage.USER_REGISTRATION_MAIL;

        }
        catch (error) {
            throw error;
        }

    }

    async userSignupVerification(signupVerificationDto: SignupVerificationDto): Promise<any> {
        try {

            const email = await this.cacheManager.get(signupVerificationDto.otp);

            if (email == null) {
                throw new CustomException(ExceptionMessage.INCORRECT_OTP, HttpStatusMessage.BAD_REQUEST).getError();
            }
            const userData = await this.cacheManager.get(`${email}+${signupVerificationDto.otp}`);
            // console.log("userData", userData);

            userData['password'] = await bcrypt.hash(userData['password'], 10);
            const createdUser = new this.UserModel(userData);
            return createdUser.save();
        }
        catch (error) {
            throw error;
        }

    }


    userLogin(email: string, password: string, deviceId: string): Observable<string>{
        return this.authService.getToken({ email, password, deviceId})
    }

}

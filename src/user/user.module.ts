import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { MailerModule } from '@nestjs-modules/mailer';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.gmail.com',
          auth: {
            
            user: process.env.GMAIL,
            pass: process.env.GMAIL_APP_PASSWORD,

          },
        },
      }),
    }),

    
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          url: 'localhost:50051',
          package: 'auth',
          protoPath: join(__dirname, '../../../proto/auth.proto'),
        },
      },
    ]),
    
  ],
  controllers: [UserController],
  providers: [
    UserService,
  ]
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [

    ConfigModule.forRoot({}),
    
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          url: process.env.AUTH_GRPC_URL,
          package: process.env.AUTH_PACKAGE,
          protoPath: process.env.AUTH_PROTO_PATH,

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

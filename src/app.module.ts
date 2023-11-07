import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    UserModule,

    CacheModule.register({ isGlobal: true }),

    MongooseModule.forRoot('mongodb+srv://Abhijeet:abhijeet@cluster0.dh4tila.mongodb.net/sample_mflix'),

    ConfigModule.forRoot({
      isGlobal: true,
    }),

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

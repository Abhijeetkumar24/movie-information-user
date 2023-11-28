
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from 'src/interface/enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  role: Role[];

  @Prop()
  notification: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
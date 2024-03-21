// user.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'auth' })
export class AuthModel extends Document {

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  tokenFor: 'email_verify' | 'forgot_password';

  @Prop({ required: true, default: new Date() })
  updatedAt: Date;
}

export const AuthSchema = SchemaFactory.createForClass(AuthModel);
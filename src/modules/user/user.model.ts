// user.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class UserModel extends Document {

  @Prop({required:true})
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ type: Date, default: Date.now, select: false })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now, select: false })
  updatedAt: Date;

  // You can add other fields like name, roles, etc. as per your requirements
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

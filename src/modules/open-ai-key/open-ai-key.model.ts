import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'open_ai_keys' })
export class OpenAiKeyModel extends Document {


  @Prop({required:true})
  apiKey: string;

  @Prop({type:Date, default:Date.now, select:false})
  createdAt: Date;

  @Prop({type:Date, default:Date.now, select:false})
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'UserModel', select: false })
  user: Types.ObjectId;

}

export const OpenAiKeySchema = SchemaFactory.createForClass(OpenAiKeyModel);

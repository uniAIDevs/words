import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'chat_gpt_models' })
export class ChatGptModelModel extends Document {


  @Prop({required:true})
  modelName: string;

  @Prop({required:true})
  modelVersion: string;

  @Prop({type:Date, default:Date.now, select:false})
  createdAt: Date;

  @Prop({type:Date, default:Date.now, select:false})
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'OpenAiKeyModel' })
  apiKey: Types.ObjectId;

}

export const ChatGptModelSchema = SchemaFactory.createForClass(ChatGptModelModel);

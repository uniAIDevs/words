import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'llm_adapters' })
export class LlmAdapterModel extends Document {


  @Prop({required:true})
  name: string;

  @Prop({required:true})
  modelType: string;

  @Prop({type:Date, default:Date.now, select:false})
  createdAt: Date;

  @Prop({type:Date, default:Date.now, select:false})
  updatedAt: Date;

}

export const LlmAdapterSchema = SchemaFactory.createForClass(LlmAdapterModel);

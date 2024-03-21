import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'merged_ll_ms' })
export class MergedLlMModel extends Document {


  @Prop({type:Date, default:Date.now, select:false})
  createdAt: Date;

  @Prop({type:Date, default:Date.now, select:false})
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'LlmApiModel' })
  llm1: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LlmApiModel' })
  llm2: Types.ObjectId;

}

export const MergedLlMSchema = SchemaFactory.createForClass(MergedLlMModel);

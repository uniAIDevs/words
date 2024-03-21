import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'llm_ap_is' })
export class LlmApIModel extends Document {


  @Prop({required:true})
  name: string;

  @Prop({required:true})
  endpoint: string;

  @Prop({type:Date, default:Date.now, select:false})
  createdAt: Date;

  @Prop({type:Date, default:Date.now, select:false})
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'UserModel', select: false })
  user: Types.ObjectId;

}

export const LlmApISchema = SchemaFactory.createForClass(LlmApIModel);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'autonomous_agents' })
export class AutonomousAgentModel extends Document {


  @Prop({required:true})
  name: string;

  @Prop({type:Date, default:Date.now, select:false})
  createdAt: Date;

  @Prop({type:Date, default:Date.now, select:false})
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'LlmApiModel' })
  llm: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UserModel', select: false })
  user: Types.ObjectId;

}

export const AutonomousAgentSchema = SchemaFactory.createForClass(AutonomousAgentModel);

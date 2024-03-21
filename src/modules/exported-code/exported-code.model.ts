import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'exported_codes' })
export class ExportedCodeModel extends Document {


  @Prop({required:true})
  code: string;

  @Prop({type:Date, default:Date.now, select:false})
  createdAt: Date;

  @Prop({type:Date, default:Date.now, select:false})
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'UserModel', select: false })
  user: Types.ObjectId;

}

export const ExportedCodeSchema = SchemaFactory.createForClass(ExportedCodeModel);

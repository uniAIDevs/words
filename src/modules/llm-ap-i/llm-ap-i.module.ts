import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LlmApIService } from './llm-ap-i.service';
import { LlmApIController } from './llm-ap-i.controller';
import { LlmApIModel, LlmApISchema } from './llm-ap-i.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LlmApIModel.name, schema: LlmApISchema },
    ]),
  ],
  controllers: [LlmApIController],
  providers: [LlmApIService],
  exports: [LlmApIService],
})
export class LlmApIModule {}

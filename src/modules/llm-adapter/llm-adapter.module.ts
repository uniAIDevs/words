import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LlmAdapterService } from './llm-adapter.service';
import { LlmAdapterController } from './llm-adapter.controller';
import { LlmAdapterModel, LlmAdapterSchema } from './llm-adapter.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LlmAdapterModel.name, schema: LlmAdapterSchema },
    ]),
  ],
  controllers: [LlmAdapterController],
  providers: [LlmAdapterService],
  exports: [LlmAdapterService],
})
export class LlmAdapterModule {}

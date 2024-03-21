import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OpenAiKeyService } from './open-ai-key.service';
import { OpenAiKeyController } from './open-ai-key.controller';
import { OpenAiKeyModel, OpenAiKeySchema } from './open-ai-key.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OpenAiKeyModel.name, schema: OpenAiKeySchema },
    ]),
  ],
  controllers: [OpenAiKeyController],
  providers: [OpenAiKeyService],
  exports: [OpenAiKeyService],
})
export class OpenAiKeyModule {}

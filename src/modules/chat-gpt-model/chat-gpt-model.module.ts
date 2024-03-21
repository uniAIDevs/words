import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGptModelService } from './chat-gpt-model.service';
import { ChatGptModelController } from './chat-gpt-model.controller';
import { ChatGptModelModel, ChatGptModelSchema } from './chat-gpt-model.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatGptModelModel.name, schema: ChatGptModelSchema },
    ]),
  ],
  controllers: [ChatGptModelController],
  providers: [ChatGptModelService],
  exports: [ChatGptModelService],
})
export class ChatGptModelModule {}

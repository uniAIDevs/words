import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MergedLlMService } from './merged-ll-m.service';
import { MergedLlMController } from './merged-ll-m.controller';
import { MergedLlMModel, MergedLlMSchema } from './merged-ll-m.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MergedLlMModel.name, schema: MergedLlMSchema },
    ]),
  ],
  controllers: [MergedLlMController],
  providers: [MergedLlMService],
  exports: [MergedLlMService],
})
export class MergedLlMModule {}

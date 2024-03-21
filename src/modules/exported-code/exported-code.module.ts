import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExportedCodeService } from './exported-code.service';
import { ExportedCodeController } from './exported-code.controller';
import { ExportedCodeModel, ExportedCodeSchema } from './exported-code.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExportedCodeModel.name, schema: ExportedCodeSchema },
    ]),
  ],
  controllers: [ExportedCodeController],
  providers: [ExportedCodeService],
  exports: [ExportedCodeService],
})
export class ExportedCodeModule {}

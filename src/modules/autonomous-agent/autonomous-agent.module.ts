import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutonomousAgentService } from './autonomous-agent.service';
import { AutonomousAgentController } from './autonomous-agent.controller';
import { AutonomousAgentModel, AutonomousAgentSchema } from './autonomous-agent.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AutonomousAgentModel.name, schema: AutonomousAgentSchema },
    ]),
  ],
  controllers: [AutonomousAgentController],
  providers: [AutonomousAgentService],
  exports: [AutonomousAgentService],
})
export class AutonomousAgentModule {}

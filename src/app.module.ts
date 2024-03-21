import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseInterceptor } from './shared/interceptor/response.interceptor';
import { UserModule } from './modules/user/user.module';
import { LlmApIModule } from './modules/llm-ap-i/llm-ap-i.module';
import { MergedLlMModule } from './modules/merged-ll-m/merged-ll-m.module';
import { LlmAdapterModule } from './modules/llm-adapter/llm-adapter.module';
import { AutonomousAgentModule } from './modules/autonomous-agent/autonomous-agent.module';
import { OpenAiKeyModule } from './modules/open-ai-key/open-ai-key.module';
import { ChatGptModelModule } from './modules/chat-gpt-model/chat-gpt-model.module';
import { ExportedCodeModule } from './modules/exported-code/exported-code.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    // Load environment variables from .env or environment
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Mongo configuration for database connection
    MongooseModule.forRoot(process.env.MONGO_URL),

    // Include the AuthModule for handling authentication and JWT
    EmailModule,
    AuthModule,

    // Include other modules for different parts of the application
    UserModule,
    LlmApIModule,
    MergedLlMModule,
    LlmAdapterModule,
    AutonomousAgentModule,
    OpenAiKeyModule,
    ChatGptModelModule,
    ExportedCodeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Use the ResponseInterceptor for intercepting and formatting responses
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },

    // Use the JwtAuthGuard for guarding routes with JWT authentication
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

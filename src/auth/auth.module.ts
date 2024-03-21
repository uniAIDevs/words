// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { AuthModel, AuthSchema } from './auth.model';
import { UserModule } from 'src/modules/user/user.module';
import { JWT_DEFAULT_SECRET } from 'src/shared/constants';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuthModel.name, schema: AuthSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }), // Register PassportModule with the 'jwt' strategy
    JwtModule.register({
      secret: JWT_DEFAULT_SECRET, // Replace with your actual secret key
      signOptions: { expiresIn: '1d' }, // Example token expiration (modify as needed)
    }),
    EmailModule,
    UserModule,
  ],
  providers: [AuthService, JwtStrategy], // Add JwtStrategy to the providers
  controllers: [AuthController],
})
export class AuthModule {}

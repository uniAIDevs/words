// auth.service.ts
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/modules/user/create-user.dto';
import { JWT_REFRESH_TOKEN_SECRET } from 'src/shared/constants';
import { ChangePasswordDto, ResetPasswordDto } from './auth.dto';
import { EmailService } from 'src/email/email.service';
import { UserService } from 'src/modules/user/user.service';
import { UserModel } from 'src/modules/user/user.model';
import { AuthModel } from './auth.model';
import { generateToken } from 'src/shared/utils/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AuthModel.name)
    private readonly authModel: Model<AuthModel>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(EmailService)
    private readonly emailService: EmailService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserModel> {
    try {
      // Check if the email is already registered
      const existingUser = await this.userService.getUserByEmail(
        createUserDto.email,
        false,
      );

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // Check if password and confirm password match
      if (createUserDto.password !== createUserDto.confirmPassword) {
        throw new BadRequestException(
          'Password and confirm password do not match',
        );
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      return await this.userService.createUser({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        confirmPassword: hashedPassword,
      });

    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  async validateUser(email: string, password: string): Promise<UserModel> {
    try {

      const user = await this.userService.getUserByEmail(email);

      if (!user.emailVerified) {
        throw new HttpException('Email is not verified', HttpStatus.FORBIDDEN);
      }
      if (user && bcrypt.compareSync(password, user.password)) {
        return user;
      }
      throw new UnauthorizedException('Invalid credentials');
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  login(user: UserModel): { accessToken: string; refreshToken: string } {
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
        secret: JWT_REFRESH_TOKEN_SECRET,
      }),
    };
  }

  // Implement reset and forgot password functionality here

  async createEmailTokenAndSendMail(email: string) {
    try {
      const user = await this.userService.getUserByEmail(email);

      const emailVerification = await this.authModel.findOne({
        email, tokenFor: 'email_verify'
      });
      if (
        emailVerification &&
        (new Date().getTime() - emailVerification.updatedAt.getTime()) / 60000 <
          3
      ) {
        throw new BadRequestException('Verification mail sent recently');
      } else {
        const token = generateToken();

        await this.authModel.findOneAndUpdate(
          { email },
          {
            email: email,
            token,
            tokenFor: 'email_verify',
          },
          {
            upsert: true,
            setDefaultsOnInsert: true,
          },
        );

        return await this.sendEmailVerification(user.email, token);
      }
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  async sendEmailVerification(
    email: string,
    token: string,
  ): Promise<void> {
    try {
      await this.emailService.sendVerificationEmail(
        email,
        `${process.env.FRONT_END_URL}/verify-email?token=${token}`,
      );
    } catch (e) {
      throw new BadRequestException('Verification mail did not send');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const auth = await this.authModel.findOne({
        token,
        tokenFor: 'email_verify',
      });

      if (auth) {
        const timeDifferenceInHours =
          (new Date().getTime() - auth.updatedAt.getTime()) / (60 * 60 * 1000);

        if (timeDifferenceInHours > 24) {
          await auth.deleteOne();
          throw new BadRequestException('Invalid Token or Token is expired');
        }

        // Find the user by their email from the decoded token
        const user = await this.userService.getUserByEmail(auth.email);

        if (user.emailVerified) {
          throw new BadRequestException('Email is already verified');
        }

        // Update the user's email verification status in the database
        await this.userService.verifyUser(auth.email);
        await auth.deleteOne();
      } else {
        throw new BadRequestException('Invalid token or token expired');
      }
    } catch (err) {
      // Handle token verification error (invalid token or token expired)
      // You can redirect the user to an error page or display an error message
      // ...
      throw new BadRequestException('Invalid token or token expired');
    }
  }

  async createForgotPasswordTokenAndSendMail(email: string) {
    try {
      const user = await this.userService.getUserByEmail(email);

      const forgotPassword = await this.authModel.findOne({
        email, tokenFor: 'forgot_password'
      });

      if (
        forgotPassword &&
        (new Date().getTime() - forgotPassword.updatedAt.getTime()) / 60000 < 3
      ) {
        throw new InternalServerErrorException(
          'Forgot password mail sent recently',
        );
      } else {
        const token = generateToken();

        await this.authModel.findOneAndUpdate(
          { email },
          {
            email: email,
            token,
            tokenFor: 'forgot_password',
          },
          {
            upsert: true,
            setDefaultsOnInsert: true,
          },
        );

        this.sendForgotPasswordEmail(user.email, token);
      }
    } catch (e) {
      throw new BadRequestException(e.message, e.code);
    }
  }

  async sendForgotPasswordEmail(
    email: string,
    token: string,
  ): Promise<void> {
    try {
      await this.emailService.sendResetPasswordEmail(
        email,
        `${process.env.FRONT_END_URL}/reset-password?token=${encodeURIComponent(
          token,
        )}`,
      );
    } catch (e) {
      throw new BadRequestException('Forgot mail did not send');
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    token: string,
  ): Promise<void> {
    try {
      // Check if password and confirm password match
      if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
        throw new BadRequestException(
          'Password and confirm password do not match',
        );
      }

      const auth = await this.authModel.findOne({
        token,
        tokenFor: 'forgot_password',
      });

      if (auth) {
        const timeDifferenceInHours =
          (new Date().getTime() - auth.updatedAt.getTime()) / (60 * 60 * 1000);

        if (timeDifferenceInHours > 24) {
          await auth.deleteOne();
          throw new BadRequestException('Invalid Token or Token is expired');
        }

        const hashedNewPassword = await bcrypt.hash(
          resetPasswordDto.password,
          10,
        );

        await this.userService.changePassword(auth.email, hashedNewPassword);

        await auth.deleteOne();
      } else {
        throw new BadRequestException('Invalid token or token expired');
      }
    } catch (err) {
      // Handle token verification error (invalid token or token expired)
      // You can redirect the user to an error page or display an error message
      // ...
      throw new BadRequestException('Invalid token or token expired');
    }
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify the refresh token and extract the user ID from it
      const decodedRefreshToken = this.jwtService.verify(refreshToken, {
        secret: JWT_REFRESH_TOKEN_SECRET,
      });

      // Check if the refresh token is valid
      const userId = decodedRefreshToken.sub;
      const user = await this.userService.getUserById(userId);

      // Generate and return a new access token if the refresh token is valid
      const newAccessToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      });
      const newRefreshToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
        },
        { secret: JWT_REFRESH_TOKEN_SECRET, expiresIn: '7d' },
      );
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      // Handle token verification error (invalid token or token expired)
      // You can throw a custom exception or return an appropriate response
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    try {

      // Check if the new password is the same as the current password
      if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
        throw new UnauthorizedException(
          'New password must be different from the current password',
        );
      }

      // Check if the new password and confirm password match
      if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
        throw new UnauthorizedException(
          'New password and confirm password do not match',
        );
      }

      // Find the user by their ID
      const user = await this.userService.getUserById(userId, {
        email: 1,
        password: 1,
      });

      // Check if the provided current password matches the stored password
      const isPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid current password');
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        10,
      );

      await this.userService.changePassword(user.email, hashedNewPassword);

    } catch (err) {
      // Handle any errors that may occur during the process
      // You can throw a custom exception or return an appropriate response
      throw new UnauthorizedException(err.message);
    }
  }
}

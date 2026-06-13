import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersRepository } from './users.repository';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';


@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'my_safe_shop_super_secret_key_2024',
      signOptions: { expiresIn: '7m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersRepository, EmailService, PrismaService],
  exports: [AuthService, JwtStrategy, JwtModule],
})
export class AuthModule {}
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: { name: string; email: string; password: string }) {
    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) throw new BadRequestException('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: Role.CLIENT,
    });

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.usersRepository.findByEmail(data.email);
    if (!user) throw new UnauthorizedException('Credenciales incorrectas');

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new UnauthorizedException('Credenciales incorrectas');

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
  }) {
    const user = await this.usersRepository.updateProfile(userId, data);
    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new BadRequestException('La contraseña actual es incorrecta');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.updatePassword(userId, hashed);
    return { message: 'Contraseña actualizada correctamente' };
  }

  private generateToken(user: any): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
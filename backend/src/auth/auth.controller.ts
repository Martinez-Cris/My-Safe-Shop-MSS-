import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsString() @IsNotEmpty() name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
}

export class LoginDto {
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registro de nuevo usuario' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }
}
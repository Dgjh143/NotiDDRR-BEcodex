
import {
  Injectable,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(datos: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { username: datos.username.trim() },
      include: { rol: true },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException(
        'Usuario o contraseña incorrectos.',
      );
    }

    const passwordCorrecta = await compare(
      datos.password,
      usuario.passwordHash,
    );

    if (!passwordCorrecta) {
      throw new UnauthorizedException(
        'Usuario o contraseña incorrectos.',
      );
    }

    const payload = {
      sub: usuario.id,
      username: usuario.username,
      rol: usuario.rol.nombre,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      accessToken: token,
      tokenType: 'Bearer',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        username: usuario.username,
        rol: usuario.rol.nombre,
      },
    };
  }
}

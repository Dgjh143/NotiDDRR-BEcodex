
import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CrearCiudadanoDto } from './dto/crear-ciudadano.dto.js';

@Injectable()
export class CiudadanosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    return this.prisma.ciudadano.findMany({
      orderBy: { creadoEn: 'desc' },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        ci: true,
        whatsapp: true,
        aceptaNotificaciones: true,
        creadoEn: true,
      },
    });
  }

  async crear(datos: CrearCiudadanoDto) {
    try {
      return await this.prisma.ciudadano.create({
        data: {
          nombres: datos.nombres.trim(),
          apellidos: datos.apellidos.trim(),
          ci: datos.ci.trim(),
          whatsapp: datos.whatsapp.trim(),
          aceptaNotificaciones: datos.aceptaNotificaciones,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Ya existe un ciudadano registrado con ese CI',
        );
      }
      throw error;
    }
  }
}

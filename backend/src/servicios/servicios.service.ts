
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ServiciosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar() {
    return this.prisma.servicio.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }
}

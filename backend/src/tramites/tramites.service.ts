
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EstadoTramite } from '../generated/prisma/enums.js';

type DatosNuevoTramite = {
  numeroDocumento: string;
  matricula: string;
  oficina: string;
  ciudadanoId: number;
  registradoPorId: number;
  serviciosIds: number[];
};

type DatosCambioEstado = {
  estado: EstadoTramite;
  funcionarioId: number;
  observacion?: string;
};

@Injectable()
export class TramitesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly detalle = {
    ciudadano: true,
    registradoPor: {
      select: {
        id: true,
        nombre: true,
        username: true,
        rol: { select: { nombre: true } },
      },
    },
    servicios: {
      include: { servicio: true },
    },
    historial: {
      orderBy: { fecha: 'desc' as const },
      include: {
        funcionario: {
          select: { id: true, nombre: true },
        },
      },
    },
    notificaciones: {
      orderBy: { creadoEn: 'desc' as const },
    },
  };

  listar() {
    return this.prisma.tramite.findMany({
      include: this.detalle,
      orderBy: { creadoEn: 'desc' },
    });
  }

  async crear(datos: DatosNuevoTramite) {
    const numeroDocumento = datos.numeroDocumento.trim();
    const matricula = datos.matricula.trim();
    const oficina = datos.oficina.trim();

    if (!numeroDocumento || !matricula || !oficina) {
      throw new BadRequestException(
        'Complete el número de documento, matrícula y oficina.',
      );
    }

    const serviciosIds = [...new Set(datos.serviciosIds)];

    if (serviciosIds.length === 0) {
      throw new BadRequestException(
        'Seleccione al menos un servicio.',
      );
    }

    const [ciudadano, funcionario, servicios, existente] =
      await Promise.all([
        this.prisma.ciudadano.findUnique({
          where: { id: datos.ciudadanoId },
        }),
        this.prisma.usuario.findUnique({
          where: { id: datos.registradoPorId },
        }),
        this.prisma.servicio.findMany({
          where: { id: { in: serviciosIds }, activo: true },
        }),
        this.prisma.tramite.findUnique({
          where: { numeroDocumento },
        }),
      ]);

    if (!ciudadano) {
      throw new NotFoundException('Ciudadano no encontrado.');
    }

    if (!funcionario || !funcionario.activo) {
      throw new BadRequestException('Funcionario no válido.');
    }

    if (existente) {
      throw new ConflictException(
        'Ya existe un trámite con ese número de documento.',
      );
    }

    if (servicios.length !== serviciosIds.length) {
      throw new BadRequestException(
        'Uno o más servicios no son válidos.',
      );
    }

    try {
      return await this.prisma.tramite.create({
        data: {
          numeroDocumento,
          matricula,
          oficina,
          ciudadanoId: datos.ciudadanoId,
          registradoPorId: datos.registradoPorId,
          estado: 'RECIBIDO',
          servicios: {
            create: serviciosIds.map((servicioId) => ({
              servicio: { connect: { id: servicioId } },
            })),
          },
        },
        include: this.detalle,
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Ese número de documento ya está registrado.',
        );
      }
      throw error;
    }
  }

  async cambiarEstado(id: number, datos: DatosCambioEstado) {
    const estadosValidos = Object.values(EstadoTramite);

    if (!estadosValidos.includes(datos.estado)) {
      throw new BadRequestException('Estado no válido.');
    }

    return this.prisma.$transaction(async (tx) => {
      const tramite = await tx.tramite.findUnique({
        where: { id },
        include: {
          ciudadano: true,
          servicios: { include: { servicio: true } },
        },
      });

      if (!tramite) {
        throw new NotFoundException('Trámite no encontrado.');
      }

      const funcionario = await tx.usuario.findUnique({
        where: { id: datos.funcionarioId },
        include: { rol: true },
      });

      if (!funcionario || !funcionario.activo) {
        throw new BadRequestException('Funcionario no válido.');
      }

      // Permiso provisional para las pruebas del Sprint 2:
      // Mesa de salida y Administrador pueden confirmar el recojo.
      // Antes de producción se exigirá rol y JWT desde el servidor.
      if (
        datos.estado === EstadoTramite.MESA_SALIDA &&
        !['MESA_SALIDA', 'ADMINISTRADOR'].includes(
          funcionario.rol.nombre,
        )
      ) {
        throw new BadRequestException(
          'No tiene permiso para confirmar Mesa de salida.',
        );
      }

      if (tramite.estado === datos.estado) {
        throw new BadRequestException(
          'El trámite ya tiene ese estado.',
        );
      }

      if (
        datos.estado === EstadoTramite.MESA_SALIDA &&
        tramite.estado === EstadoTramite.ENTREGADO
      ) {
        throw new BadRequestException(
          'Un trámite entregado no puede volver a Mesa de salida.',
        );
      }

      const actualizado = await tx.tramite.update({
        where: { id },
        data: { estado: datos.estado },
      });

      await tx.historialEstado.create({
        data: {
          tramiteId: id,
          funcionarioId: funcionario.id,
          estadoAnterior: tramite.estado,
          estadoNuevo: datos.estado,
          observacion: datos.observacion?.trim() || null,
        },
      });

      if (
        datos.estado === EstadoTramite.MESA_SALIDA &&
        tramite.ciudadano.aceptaNotificaciones
      ) {
        const servicios = tramite.servicios
          .map((s) => s.servicio.nombre)
          .join(', ');

        const mensaje =
          `NotiDDRR - Derechos Reales\n` +
          `Estimado/a ${tramite.ciudadano.nombres} ` +
          `${tramite.ciudadano.apellidos}:\n` +
          `Su documento N.º ${tramite.numeroDocumento} ` +
          `correspondiente a la matrícula ${tramite.matricula} ` +
          `se encuentra listo para recoger.\n` +
          `Servicios: ${servicios}.\n` +
          `Oficina: ${tramite.oficina}.\n` +
          `Preséntese con su documento de identidad.`;

        await tx.notificacion.create({
          data: {
            tramiteId: id,
            telefono: tramite.ciudadano.whatsapp,
            mensaje,
            estado: 'PENDIENTE',
          },
        });
      }

      return {
        mensaje: 'Estado actualizado correctamente.',
        tramite: actualizado,
      };
    });
  }
}


import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { EstadoTramite } from '../generated/prisma/enums.js';
import { TramitesService } from './tramites.service.js';

class CrearTramiteDto {
  @IsString()
  numeroDocumento!: string;

  @IsString()
  matricula!: string;

  @IsString()
  oficina!: string;

  @IsInt()
  @Min(1)
  ciudadanoId!: number;

  @IsInt()
  @Min(1)
  registradoPorId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  serviciosIds!: number[];
}

class CambiarEstadoDto {
  @IsEnum(EstadoTramite)
  estado!: EstadoTramite;

  @IsInt()
  @Min(1)
  funcionarioId!: number;

  @IsOptional()
  @IsString()
  observacion?: string;
}

@Controller('tramites')
export class TramitesController {
  constructor(private readonly tramites: TramitesService) {}

  @Get()
  listar() {
    return this.tramites.listar();
  }

  @Post()
  crear(@Body() datos: CrearTramiteDto) {
    return this.tramites.crear(datos);
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: CambiarEstadoDto,
  ) {
    return this.tramites.cambiarEstado(id, datos);
  }
}

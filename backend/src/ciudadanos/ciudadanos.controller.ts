
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CiudadanosService } from './ciudadanos.service.js';
import { CrearCiudadanoDto } from './dto/crear-ciudadano.dto.js';

@Controller('ciudadanos')
export class CiudadanosController {
  constructor(
    private readonly ciudadanosService: CiudadanosService,
  ) {}

  @Get()
  listar() {
    return this.ciudadanosService.listar();
  }

  @Post()
  crear(@Body() datos: CrearCiudadanoDto) {
    return this.ciudadanosService.crear(datos);
  }
}

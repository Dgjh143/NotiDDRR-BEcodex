
import { Controller, Get } from '@nestjs/common';
import { ServiciosService } from './servicios.service.js';

@Controller('servicios')
export class ServiciosController {
  constructor(private readonly servicios: ServiciosService) {}

  @Get()
  listar() {
    return this.servicios.listar();
  }
}

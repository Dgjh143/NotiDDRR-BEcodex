
import { Module } from '@nestjs/common';
import { CiudadanosController } from './ciudadanos.controller.js';
import { CiudadanosService } from './ciudadanos.service.js';

@Module({
  controllers: [CiudadanosController],
  providers: [CiudadanosService],
})
export class CiudadanosModule {}

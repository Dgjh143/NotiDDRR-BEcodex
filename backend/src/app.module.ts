
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CiudadanosModule } from './ciudadanos/ciudadanos.module.js';

@Module({
  imports: [PrismaModule, CiudadanosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CiudadanosModule } from './ciudadanos/ciudadanos.module.js';
import { AuthModule } from './auth/auth.module.js';
import { TramitesModule } from './tramites/tramites.module.js';
import { ServiciosModule } from './servicios/servicios.module.js';

@Module({
  imports: [PrismaModule, CiudadanosModule, AuthModule, TramitesModule, ServiciosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

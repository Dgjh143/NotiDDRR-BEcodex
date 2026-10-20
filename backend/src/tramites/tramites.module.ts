import { Module } from '@nestjs/common';
import { TramitesController } from './tramites.controller.js';
import { TramitesService } from './tramites.service.js';

@Module({
  controllers: [TramitesController],
  providers: [TramitesService]
})
export class TramitesModule {}

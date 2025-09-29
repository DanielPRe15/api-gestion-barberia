import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarbershopConfig } from './entity/barbershop-config.entity';
import { BarbershopConfigService } from './services/barbershop-config.service';
import { BarbershopConfigController } from './controller/barbershop-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BarbershopConfig])],
  providers: [BarbershopConfigService],
  controllers: [BarbershopConfigController],
  exports: [BarbershopConfigService],
})
export class BarbershopConfigModule {}

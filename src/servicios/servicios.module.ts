import { Module } from '@nestjs/common';
import { ServiciosController } from './controller/servicios.controller';
import { ServiciosService } from './service/servicios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service])],
  controllers: [ServiciosController],
  providers: [ServiciosService],
  exports: [ServiciosService]
})
export class ServiciosModule {}

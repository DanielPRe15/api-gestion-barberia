import { Module } from '@nestjs/common';
import { CitasService } from './service/citas.service';
import { CitasController } from './controller/citas.controller';
import { ClientesModule } from 'src/clientes/clientes.module';
import { BarberosModule } from 'src/barberos/barberos.module';
import { ServiciosModule } from 'src/servicios/servicios.module';
import { PagosModule } from 'src/pagos/pagos.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Barber } from 'src/barberos/entities/barber.entity';
import { Client } from 'src/clientes/entities/client.entity';
import { Service } from 'src/servicios/entities/service.entity';
import { BarbershopConfigModule } from 'src/barberShopConfig/barbershop-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Barber, Client, Service]),
    ClientesModule,
    BarberosModule,
    ServiciosModule,
    PagosModule,
    BarbershopConfigModule,
    CitasModule
  ],
  providers: [CitasService],
  controllers: [CitasController],
  exports: [CitasService]
})
export class CitasModule {}

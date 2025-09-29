import { forwardRef, Module } from '@nestjs/common';
import { PagosController } from './controller/pagos.controller';
import { PagosService } from './service/pagos.service';
import { CitasModule } from 'src/citas/citas.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Appointment } from 'src/citas/entities/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Appointment]),
    forwardRef(() => CitasModule)
  ],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService]
})
export class PagosModule {}

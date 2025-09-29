import { Module } from '@nestjs/common';
import { BarberosController } from './controllers/barberos.controller';
import { BarberosService } from './services/barberos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Barber } from './entities/barber.entity';



@Module({
  imports: [TypeOrmModule.forFeature([Barber])],
  controllers: [BarberosController],
  providers: [BarberosService],
  exports: [BarberosService]
})
export class BarberosModule {}

import {
  Controller,
  Delete,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CitasService } from '../service/citas.service';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('appointments')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Get()
  async findAll() {
    try {
      return await this.citasService.findAll();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener citas',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

    @Get('horarios-disponibles')
  async getHorariosDisponibles(
    @Query('barberId') barberId: string,
    @Query('date') date: string,
    @Query('serviceIds') serviceIds: string,
  ) {
    // serviceIds llega como string separado por comas
    const ids = serviceIds.split(',');
    return this.citasService.getHorariosDisponibles(barberId, date, ids);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      return await this.citasService.findById(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener la cita',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    try {
      return await this.citasService.createAppointment(createAppointmentDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al crear la cita',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('cancel/:id')
  async cancelAppointment(@Param('id') id: string) {
    try {
      return await this.citasService.cancelAppointment(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al cancelar la cita',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('complete/:id')
  async completeAppointment(@Param('id') id: string) {
    try {
      return await this.citasService.completeAppointment(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al completar la cita',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


}

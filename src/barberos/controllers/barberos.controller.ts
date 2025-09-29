import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CreateBarberDto } from '../dto/create-barber.dto';
import { UpdateBarberDto } from '../dto/update-barber.dto';
import { BarberosService } from '../services/barberos.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('barbers')
export class BarberosController {
  constructor(private readonly barberosService: BarberosService) {}

  @Post()
  create(@Body() createBarberDto: CreateBarberDto) {
    try {
      return this.barberosService.create(createBarberDto);
    } catch (error) {
      throw new Error('Error al crear el barbero');
    }
  }

  @Get()
  findAll() {
    try {
      return this.barberosService.findAll();
    } catch (error) {
      throw new Error('Error al obtener la lista de barberos');
    }
  }

  @Get('paginated')
  async findAllPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: 'ACTIVE' | 'INACTIVE' | 'VACATION',
    @Query('workDays') workDays?: string, // Viene como "MONDAY,TUESDAY,FRIDAY"
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const filters = {
      search,
      status,
      workDays: workDays ? workDays.split(',') : undefined,
    };

    return this.barberosService.findAllPaginated(
      Number(page),
      Number(limit),
      filters,
      sortBy,
      sortOrder,
    );
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    try {
      return this.barberosService.findById(id);
    } catch (error) {
      throw new Error('Error al obtener el barbero');
    }
  }

  @Get('agenda/:id')
  getAgenda(@Param('id') id: string) {
    return this.barberosService.getAgenda(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBarberDto: UpdateBarberDto) {
    try {
      return this.barberosService.update(id, updateBarberDto);
    } catch (error) {
      throw new Error('Error al actualizar el barbero');
    }
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    try {
      this.barberosService.delete(id);
      return { message: 'Barbero inactivado correctamente' };
    } catch (error) {
      throw new Error('Error al eliminar el barbero');
    }
  }

  @Get(':id/statistics')
  getBarberStatistics(@Param('id') id: string) {
    try {
      return this.barberosService.getBarberStatistics(id);
    } catch (error) {
      throw new Error('Error al obtener las estadísticas del barbero');
    }
  }

  @Get(':id/agenda/today')
  getTodayAgenda(@Param('id') id: string) {
    return this.barberosService.getTodayAgenda(id);
  }

  @Patch(':id/status')
  updateBarberStatus(
    @Param('id') id: string,
    @Body() statusData: { status: 'ACTIVE' | 'INACTIVE' | 'VACATION' },
  ) {
    return this.barberosService.updateBarberStatus(id, statusData.status);
  }
}

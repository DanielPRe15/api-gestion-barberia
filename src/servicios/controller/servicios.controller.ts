import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ServiciosService } from '../service/servicios.service';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('services')
export class ServiciosController {

    constructor(private readonly serviciosService: ServiciosService
                
    ) {}

    @Post()
    create(@Body() createServiceDto: CreateServiceDto) {
        try {
            return this.serviciosService.create(createServiceDto);
        } catch (error) {
            throw new Error('Error al crear el servicio');
        }
    }

    @Get()
    findAll() {
        try {
            return this.serviciosService.findAll();
        } catch (error) {
            throw new Error('Error al obtener la lista de servicios');
        }
    }

  @Get('paginated')
  async findAllPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: 'ACTIVE' | 'INACTIVE',
    @Query('sortBy') sortBy: string = 'name',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC'
  ) {
     try {
         const filters = { search, status };
         return await this.serviciosService.findAllPaginated(
             page,
             limit,
             filters,
             sortBy,
             sortOrder
         );
     } catch (error) {
         throw new Error('Error al obtener los servicios paginados');
     }
  }

    @Get(':id')
    findOne(@Param('id') id: number) {
        try {
            return this.serviciosService.findById(id);
        } catch (error) {
            throw new Error('Error al obtener el servicio');
        }
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        try {
            return this.serviciosService.delete(id);
        } catch (error) {
            throw new Error('Error al eliminar el servicio');
        }
    }

    @Patch(':id')
    update(@Param('id') id: number, @Body() updateServiceDto: UpdateServiceDto) {
        try {
            return this.serviciosService.update(id, updateServiceDto);
        } catch (error) {
            throw new Error('Error al actualizar el servicio');
        }
    }


}

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
import { ClientesService } from '../service/clientes.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('clients')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  create(@Body() createClientDto) {
    try {
      return this.clientesService.create(createClientDto);
    } catch (error) {
      throw new Error('Error al crear el cliente');
    }
  }

  @Get()
  findAll() {
    try {
      return this.clientesService.findAll();
    } catch (error) {
      throw new Error('Error al obtener la lista de clientes');
    }
  }

  @Get('paginated')
  async findAllPaginated(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('search') search?: string,
  @Query('firstName') firstName?: string,
  @Query('lastName') lastName?: string,
  @Query('email') email?: string,
  @Query('status') status?: string,
  @Query('sortBy') sortBy: string = 'createdAt',
  @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC'
  ) {
    try {
      const filters = { search, firstName, lastName, email, status };
      return this.clientesService.findAllPaginated( Number(page), 
    Number(limit), 
    filters, 
    sortBy, 
    sortOrder);
    } catch (error) {
      throw new Error('Error al obtener la lista de clientes');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    try {
      return this.clientesService.findById(id);
    } catch (error) {
      throw new Error('Error al obtener el cliente');
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto) {
    try {
      return this.clientesService.update(id, updateClientDto);
    } catch (error) {
      throw new Error('Error al actualizar el cliente');
    }
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    try {
      this.clientesService.delete(id);
      return { message: 'Cliente inactivado correctamente' };
    } catch (error) {
      throw new Error('Error al eliminar el cliente');
    }
  }
}

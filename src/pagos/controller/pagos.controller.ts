import { Controller, Get, Post, Patch, Delete, Param, Body, HttpException, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { PagosService } from '../service/pagos.service';
import { CreatePaymentDto } from '../dto/create-Payment.dto';
import { UpdatePaymentDto } from '../dto/update-Payment.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('payments')
export class PagosController {
	constructor(private readonly pagosService: PagosService) {}

	@Get()
	async findAll() {
		try {
			return await this.pagosService.findAllPayments();
		} catch (error) {
			throw new HttpException(error.message || 'Error al obtener pagos', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Get('paginated')
  async findAllPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED',
    @Query('paymentMethod') paymentMethod?: 'CASH' | 'CARD' | 'YAPE' | 'PLIN',
  ) {
    const filters = {
      search,
      status,
      paymentMethod,
    };

    return this.pagosService.findAllPaymentsPaginated(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      filters,
    );
  }

	@Get(':id')
	async findById(@Param('id') id: string) {
		try {
			return await this.pagosService.findPaymentById(id);
		} catch (error) {
			throw new HttpException(error.message || 'Error al obtener el pago', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Post()
	async create(@Body() createPaymentDto: CreatePaymentDto) {
		try {
			return await this.pagosService.createPayment(createPaymentDto);
		} catch (error) {
			throw new HttpException(error.message || 'Error al crear el pago', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Patch(':id')
	async update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
		try {
			return await this.pagosService.updatePayment(id, updatePaymentDto);
		} catch (error) {
			throw new HttpException(error.message || 'Error al actualizar el pago', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Delete(':id')
	async delete(@Param('id') id: string) {
		try {
			return await this.pagosService.deletePayment(id);
		} catch (error) {
			throw new HttpException(error.message || 'Error al eliminar el pago', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Patch('pay/:id')
	async marcarComoPagado(@Param('id') id: string) {
		try {
			return await this.pagosService.markPaymentAsPaid(id);
		} catch (error) {
			throw new HttpException(error.message || 'Error al marcar el pago como pagado', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Patch('fail/:id')
	async marcarComoFallido(@Param('id') id: string) {
		try {
			return await this.pagosService.markPaymentAsFailed(id);
		} catch (error) {
			throw new HttpException(error.message || 'Error al marcar el pago como fallido', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}

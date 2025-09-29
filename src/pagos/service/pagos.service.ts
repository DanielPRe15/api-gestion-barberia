import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { CreatePaymentDto } from '../dto/create-Payment.dto';
import { UpdatePaymentDto } from '../dto/update-Payment.dto';
import { Appointment } from 'src/citas/entities/appointment.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async createPayment(dto: CreatePaymentDto): Promise<Payment> {
    // Validar que la cita exista
    const appointment = await this.appointmentRepository.findOne({
      where: { id: dto.appointmentId },
      relations: ['payment'],
    });
    if (!appointment) {
      throw new NotFoundException('Cita no encontrada para asociar el pago');
    }
    if (appointment.payment) {
      throw new BadRequestException('La cita ya tiene un pago asociado');
    }
    const payment = this.paymentRepository.create({
      amount: dto.amount,
      paymentDate: dto.paymentDate,
      paymentMethod: dto.paymentMethod,
      status: dto.status,
      appointment,
    });
    await this.paymentRepository.save(payment);
    // Relacionar el pago con la cita
    appointment.payment = payment;
    await this.appointmentRepository.save(appointment);
    return payment;
  }

  async findAllPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({ relations: ['appointment'] });
  }

  async findAllPaymentsPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      status?: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED';
      paymentMethod?: 'CASH' | 'CARD' | 'YAPE' | 'PLIN';
    },
    sortBy: string = 'paymentDate',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{
    data: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.appointment', 'appointment')
      .leftJoinAndSelect('appointment.client', 'client')
      .leftJoinAndSelect('appointment.barber', 'barber')
      .leftJoinAndSelect('appointment.services', 'services');

    if (filters?.search) {
      query.andWhere(
        `(client.firstName ILIKE :search OR 
        client.lastName ILIKE :search OR 
        barber.firstName ILIKE :search OR 
        barber.lastName ILIKE :search OR 
        appointment.id::text ILIKE :search OR
        payment.id::text ILIKE :search)`,
        { search: `%${filters.search}%` },
      );
    }

    // Filtros específicos
    if (filters?.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters?.paymentMethod) {
      query.andWhere('payment.paymentMethod = :paymentMethod', {
        paymentMethod: filters.paymentMethod,
      });
    }

    // Ordenamiento dinámico
    const allowedSortFields = [
      'id',
      'amount',
      'paymentDate',
      'paymentMethod',
      'status',
      'createdAt',
      'updatedAt',
    ];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'paymentDate';
    query.orderBy(`payment.${safeSortBy}`, sortOrder);

    // Paginación
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['appointment'],
    });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }

  async updatePayment(id: string, dto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findPaymentById(id);
    Object.assign(payment, dto);
    await this.paymentRepository.save(payment);
    return payment;
  }

  async deletePayment(id: string): Promise<boolean> {
    const payment = await this.findPaymentById(id);
    await this.paymentRepository.remove(payment);
    return true;
  }

  async findPaymentsByAppointmentId(appointmentId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { appointment: { id: appointmentId } },
      relations: ['appointment'],
    });
  }

  async findPaymentsByStatus(
    status: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED',
  ): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { status },
      relations: ['appointment'],
    });
  }

  async markPaymentAsPaid(id: string): Promise<Payment> {
    const payment = await this.findPaymentById(id);
    payment.status = 'PAID';
    await this.paymentRepository.save(payment);

    //Cambiar el estado de la cita asociada a COMPLETED si el pago es PAID
    if (payment.appointment) {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: payment.appointment.id },
      });
      if (appointment) {
        appointment.status = 'COMPLETED';
        await this.appointmentRepository.save(appointment);
      }
    }

    return payment;
  }

  async markPaymentAsFailed(id: string): Promise<Payment> {
    const payment = await this.findPaymentById(id);
    payment.status = 'FAILED';
    await this.paymentRepository.save(payment);

    // Cambiar el estado de la cita asociada a PENDING si el pago es FAILED
    if (payment.appointment) {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: payment.appointment.id },
      });
      if (appointment) {
        appointment.status = 'PENDING';
        await this.appointmentRepository.save(appointment);
      }
    }

    return payment;
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBarberDto } from '../dto/create-barber.dto';
import { Barber } from '../entities/barber.entity';
import { UpdateBarberDto } from '../dto/update-barber.dto';

@Injectable()
export class BarberosService {
  constructor(
    @InjectRepository(Barber)
    private readonly BarbersRepository: Repository<Barber>,
  ) {}

  async create(barbero: CreateBarberDto): Promise<Barber> {
    const existingBarber = await this.BarbersRepository.findOne({
      where: { email: barbero.email },
    });
    if (existingBarber) {
      throw new ConflictException(
        `Barbero con email ${barbero.email} ya existe`,
      );
    }
    const newBarbero = this.BarbersRepository.create({
      ...barbero,
      hireDate: new Date(),
      status: 'ACTIVE',
    });
    return this.BarbersRepository.save(newBarbero);
  }

  async findAll(): Promise<Barber[]> {
    return await this.BarbersRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findAllPaginated(
  page: number = 1,
  limit: number = 10,
  filters?: {
    search?: string;                 
    status?: 'ACTIVE' | 'INACTIVE' | 'VACATION'; 
    workDays?: string[];    
  },
  sortBy: string = 'createdAt',
  sortOrder: 'ASC' | 'DESC' = 'DESC'
): Promise<{
  data: Barber[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const query = this.BarbersRepository.createQueryBuilder('barber');

  // Búsqueda general (busca en nombre, apellido, email o teléfono)
  if (filters?.search) {
    query.andWhere(
      '(barber.firstName ILIKE :search OR barber.lastName ILIKE :search OR barber.email ILIKE :search OR barber.phone ILIKE :search)',
      { search: `%${filters.search}%` }
    );
  }
    // Filtro por estado

  if (filters?.status) {
    query.andWhere('barber.status = :status', { status: filters.status });
  }

  // Filtro por días de trabajo (si el barbero trabaja alguno de los días especificados)
  if (filters?.workDays && filters.workDays.length > 0) {
    query.andWhere('barber.workDays && :workDays', { workDays: filters.workDays });
  }

  // Ordenamiento dinámico
  const allowedSortFields = ['createdAt', 'firstName', 'lastName', 'email', 'hireDate', 'status'];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  query.orderBy(`barber.${safeSortBy}`, sortOrder);

  // Paginación
  query.skip((page - 1) * limit).take(limit);

  // Incluir relaciones básicas si las necesitas
  query.leftJoinAndSelect('barber.appointments', 'appointments');

  const [data, total] = await query.getManyAndCount();
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages
  };
}

  async findById(id: string): Promise<Barber> {
    const barber = await this.BarbersRepository.findOne({
      where: { id },
      relations: ['appointments'],
    });

    if (!barber) {
      throw new NotFoundException(`Barber with id ${id} not found`);
    }
    return barber;
  }

  async getAgenda(barberId: string) {
    const barber = await this.BarbersRepository.findOne({
      where: { id: barberId },
      relations: [
        'appointments',
        'appointments.client',
        'appointments.services',
      ],
      order: { appointments: { date: 'ASC', time: 'ASC' } },
    });
    if (!barber) {
      throw new NotFoundException('Barbero no encontrado');
    }
    return barber.appointments;
  }

  async update(id: string, updatedBarberso: UpdateBarberDto): Promise<Barber> {
    const barber = await this.findById(id);
    Object.assign(barber, updatedBarberso);
    return this.BarbersRepository.save(barber);
  }

  async delete(id: string): Promise<void> {
    await this.BarbersRepository.delete(id);
  }

  async getBarberStatistics(barberId: string) {
    const barber = await this.BarbersRepository.findOne({
      where: { id: barberId },
      relations: ['appointments'],
    });

    if (!barber) {
      throw new NotFoundException('Barbero no encontrado');
    }

    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalAppointments = barber.appointments.length;
    const weekAppointments = barber.appointments.filter(
      (apt) => new Date(apt.createdAt) >= weekStart,
    ).length;
    const monthAppointments = barber.appointments.filter(
      (apt) => new Date(apt.createdAt) >= monthStart,
    ).length;

    return {
      citasTotales: totalAppointments,
      promedioSemana: Math.round(weekAppointments / 4),
      promedioMes: monthAppointments,
    };
  }

  async getTodayAgenda(barberId: string) {
    const today = new Date().toISOString().split('T')[0];

    const barber = await this.BarbersRepository.findOne({
      where: { id: barberId },
      relations: [
        'appointments',
        'appointments.client',
        'appointments.services',
      ],
    });

    if (!barber) {
      throw new NotFoundException('Barbero no encontrado');
    }

    const todayAppointments = barber.appointments.filter(
      (apt) => apt.date === today,
    );

    return {
      pendientes: todayAppointments.filter(
        (apt) => apt.status === 'SCHEDULED' || apt.status === 'PENDING',
      ),
      completadas: todayAppointments.filter(
        (apt) => apt.status === 'COMPLETED',
      ),
    };
  }

  async updateBarberStatus(
    barberId: string,
    status: 'ACTIVE' | 'INACTIVE' | 'VACATION',
  ): Promise<Barber> {
    const barber = await this.findById(barberId);
    barber.status = status;
    return this.BarbersRepository.save(barber);
  }
}

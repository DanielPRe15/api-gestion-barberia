import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Service } from '../entities/service.entity';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Service)
    private readonly serviciosRepository: Repository<Service>,
  ) {}

  async create(servicio: CreateServiceDto): Promise<Service> {
    const existingService = await this.serviciosRepository.findOne({
      where: { name: servicio.name },
    });
    if (existingService) {
      throw new ConflictException(
        `Servicio con nombre ${servicio.name} ya existe`,
      );
    }
    const newServicio = this.serviciosRepository.create({
      ...servicio,
      status: 'ACTIVE',
    });
    return this.serviciosRepository.save(newServicio);
  }

  async findAll(): Promise<Service[]> {
    return await this.serviciosRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string; // Búsqueda general (nombre, descripción)
      status?: 'ACTIVE' | 'INACTIVE'; // Filtro por estado
    },
    sortBy: string = 'name',
    sortOrder: 'ASC' | 'DESC' = 'ASC',
  ): Promise<{
    data: Service[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const query = this.serviciosRepository.createQueryBuilder('service');

    // Búsqueda general (busca en nombre y descripción)
    if (filters?.search) {
      query.andWhere(
        '(service.name ILIKE :search OR service.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.status) {
      query.andWhere('service.status = :status', { status: filters.status });
    }

    // Ordenamiento dinámico
    const allowedSortFields = [
      'id',
      'name',
      'price',
      'duration',
      'status',
      'createdAt',
      'updatedAt',
    ];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    query.orderBy(`service.${safeSortBy}`, sortOrder);

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

  async findById(id: number): Promise<Service> {
    const servicio = await this.serviciosRepository.findOne({ where: { id } });
    if (!servicio) {
      throw new NotFoundException(`Servicio con id ${id} no encontrado`);
    }
    return servicio;
  }

  async update(
    id: number,
    updatedServicio: UpdateServiceDto,
  ): Promise<Service> {
    const servicio = await this.findById(id);
    Object.assign(servicio, updatedServicio);
    return this.serviciosRepository.save(servicio);
  }

  async delete(id: number): Promise<void> {
    await this.serviciosRepository.delete(id);
  }
}

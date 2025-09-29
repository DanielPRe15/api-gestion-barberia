import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from '../dto/create-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateClientDto } from '../dto/update-client.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(cliente: CreateClientDto): Promise<Client> {
    const existingClient = await this.clientRepository.findOne({
      where: { email: cliente.email },
    });
    if (existingClient) {
      throw new ConflictException(
        `Cliente con email ${cliente.email} ya existe`,
      );
    }
    const newClient = this.clientRepository.create({
      ...cliente,
      registrationDate: new Date(),
      status: 'ACTIVE',
    });
    return this.clientRepository.save(newClient);
  }

  async findAll(): Promise<Client[]> {
    return await this.clientRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findAllPaginated(
   page: number = 1,
  limit: number = 10,
  filters?: {
    search?: string;       
    firstName?: string;     
    lastName?: string;      
    email?: string;         
    status?: string;        
  },
  sortBy: string = 'createdAt',
  sortOrder: 'ASC' | 'DESC' = 'DESC'
): Promise<{
  data: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const query = this.clientRepository.createQueryBuilder('client');

  // Búsqueda general (busca en nombre, apellido o email)
  if (filters?.search) {
    query.andWhere(
      '(client.firstName ILIKE :search OR client.lastName ILIKE :search OR client.email ILIKE :search)',
      { search: `%${filters.search}%` }
    );
  }

  // Filtros específicos
  if (filters?.firstName) {
    query.andWhere('client.firstName ILIKE :firstName', { 
      firstName: `%${filters.firstName}%` 
    });
  }

  if (filters?.lastName) {
    query.andWhere('client.lastName ILIKE :lastName', { 
      lastName: `%${filters.lastName}%` 
    });
  }

  if (filters?.email) {
    query.andWhere('client.email ILIKE :email', { 
      email: `%${filters.email}%` 
    });
  }

  if (filters?.status) {
    query.andWhere('client.status = :status', { status: filters.status });
  }

  // Ordenamiento dinámico
  query.orderBy(`client.${sortBy}`, sortOrder);

  // Paginación
  query.skip((page - 1) * limit).take(limit);

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

  async findById(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['appointments', 'appointments.barber', 'appointments.services']
    });
    if (!client) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }
    return client;
  }

  async update(id: string, updatedClient: UpdateClientDto): Promise<Client> {
    const client = await this.findById(id);

    if (!client) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }

    Object.assign(client, updatedClient);
    return this.clientRepository.save(client);
  }

  async delete(id: string): Promise<void> {
    const client = await this.findById(id);
    if (!client) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }
    await this.clientRepository.delete(id);
  }
}

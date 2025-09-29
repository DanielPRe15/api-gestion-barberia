import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Appointment } from '../entities/appointment.entity';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { PagosService } from 'src/pagos/service/pagos.service';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Barber } from 'src/barberos/entities/barber.entity';
import { Client } from 'src/clientes/entities/client.entity';
import { Service } from 'src/servicios/entities/service.entity';
import { BarbershopConfigService } from 'src/barberShopConfig/services/barbershop-config.service';

function toMinutes(time: string): number {
  const [h, m] = time.split(':');
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

function normalizeDay(day: string): string {
  return day
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

// function toDateString(date: Date | string): string {
//   const d = typeof date === 'string' ? new Date(date) : date;
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, '0');
//   const day = String(d.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// }

function toTimeString(time: string): string {
  // Si ya tiene segundos, regresa igual
  if (time.length === 8) return time;
  // Si solo tiene HH:mm, agrega :00
  if (time.length === 5) return `${time}:00`;
  return time;
}

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Barber)
    private readonly barberRepository: Repository<Barber>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,

    private readonly pagosService: PagosService,
    private readonly barberConfig: BarbershopConfigService,
  ) {}

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      order: { createdAt: 'ASC' },
      relations: ['barber', 'client', 'services', 'payment'],
    });
  }

  async findById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['barber', 'client', 'services', 'payment'],
    });
    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }
    return appointment;
  }

  async createAppointment(
    appointment: CreateAppointmentDto,
  ): Promise<Appointment> {
    const { barberId, clientId, serviceIds, paymentMethod} = appointment;
    const barber = await this.barberRepository.findOneBy({ id: barberId });
    const client = await this.clientRepository.findOneBy({ id: clientId });
    const services = await this.serviceRepository.findBy({
      id: In(serviceIds),
    });

    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);

    if (!barber) {
      throw new NotFoundException('Barbero no encontrado');
    }
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
    if (!services || services.length === 0) {
      throw new NotFoundException('Servicios no encontrados');
    }

    // Validacion: No se puede crear una cita en el pasado

    const citaFechaHora = new Date(
      `${appointment.date}T${toTimeString(appointment.time)}`,
    );
    const ahora = new Date();

    console.log('appointment.date:', appointment.date);
    console.log('appointment.time:', appointment.time);
    console.log('citaFechaHora:', citaFechaHora);
    console.log('ahora:', ahora);

    if (citaFechaHora < ahora) {
      throw new BadRequestException('No se puede crear una cita en el pasado');
    }

    // Validacion: No se puede asignar una cita a un barbero inactivo
    if (barber.status !== 'ACTIVE') {
      throw new BadRequestException(
        'No se puede asignar una cita a un barbero inactivo',
      );
    }

    const barberConfig = await this.barberConfig.getConfig();
    if (!barberConfig) {
      throw new BadRequestException(
        'No hay configuración general de la barbería registrada.',
      );
    }

    const citaHoraNorm = toMinutes(appointment.time);
    const openHourNorm = toMinutes(barberConfig.openHour);
    const closeHourNorm = toMinutes(barberConfig.closeHour);

    const citaDateObj = new Date(appointment.date);
    const citaDia = citaDateObj
      .toLocaleString('es-ES', { weekday: 'long' })
      .toUpperCase();
    const citaDiaNorm = normalizeDay(citaDia);
    const workDaysNorm = barberConfig.workDays.map(normalizeDay);

    if (
      citaHoraNorm < openHourNorm ||
      citaHoraNorm > closeHourNorm ||
      !workDaysNorm.includes(citaDiaNorm)
    ) {
      throw new BadRequestException(
        'La cita está fuera del horario de la barbería',
      );
    }

    // validacion: No se puede asignar una cita fuera del horario de trabajo del barbero
    const barberStartNorm = toMinutes(barber.startHour);
    const barberEndNorm = toMinutes(barber.endHour);
    const barberWorkDaysNorm = barber.workDays.map(normalizeDay);

    if (
      citaHoraNorm < barberStartNorm ||
      citaHoraNorm > barberEndNorm ||
      !barberWorkDaysNorm.includes(citaDiaNorm)
    ) {
      throw new BadRequestException(
        'La cita está fuera del horario de trabajo del barbero',
      );
    }

    // Validacion: No se puede asignar dos citas al mismo barbero a la misma hora
    const conflictCita = await this.appointmentRepository.findOne({
      where: {
        barber: { id: barberId },
        date: appointment.date,
        time: toTimeString(appointment.time),
        status: In(['SCHEDULED', 'PENDING', 'COMPLETED']),
      },
    });
    if (conflictCita) {
      throw new BadRequestException(
        'El barbero ya tiene una cita agendada para esa fecha y hora',
      );
    }

    // Validacion: No se puede asignar dos citas al mismo cliente a la misma hora
    const conflictClientCita = await this.appointmentRepository.findOne({
      where: {
        client: { id: clientId },
        date: appointment.date,
        time: toTimeString(appointment.time),
        status: In(['SCHEDULED', 'PENDING', 'COMPLETED']),
      },
    });
    if (conflictClientCita) {
      throw new BadRequestException(
        'El cliente ya tiene una cita agendada para esa fecha y hora',
      );
    }

    // Estado de la cita según la fecha
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDateObj = new Date(appointment.date);
    appointmentDateObj.setHours(0, 0, 0, 0);

    let statusOptions: 'SCHEDULED' | 'PENDING';
    if (appointmentDateObj.getTime() > today.getTime()) {
      statusOptions = 'SCHEDULED';
    } else {
      statusOptions = 'PENDING';
    }

    const newCita = this.appointmentRepository.create({
      ...appointment,
      date: appointment.date,
      time: toTimeString(appointment.time),
      status: statusOptions,
      barber,
      client,
      services,
      totalPrice,
      totalDuration,
    });
    await this.appointmentRepository.save(newCita);

    await this.pagosService.createPayment({
      appointmentId: newCita.id,
      amount: newCita.totalPrice,
      paymentDate: new Date(),
      paymentMethod: paymentMethod || 'CASH',
      status: 'PENDING',
    });

    return newCita;
  }

  async cancelAppointment(appointmentId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (!['SCHEDULED', 'PENDING'].includes(appointment.status)) {
      throw new BadRequestException(
        'Solo puedes cancelar citas agendadas o pendientes',
      );
    }

    // Validación: Cancelar cita solo hasta 2 horas antes
    const ahora = new Date();
    const fechaCita = new Date(`${appointment.date}T${appointment.time}`);
    const diffMs = fechaCita.getTime() - ahora.getTime();
    const diffHoras = diffMs / (1000 * 60 * 60);

    if (diffHoras < 2) {
      throw new BadRequestException(
        'Solo puedes cancelar la cita hasta 2 horas antes.',
      );
    }

    appointment.status = 'CANCELLED';
    await this.appointmentRepository.save(appointment);

    return appointment;
  }

  async completeAppointment(appointmentId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['payment'],
    });
    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }
    if (!appointment.payment) {
      throw new BadRequestException(
        'No se puede completar la cita: no tiene pago registrado',
      );
    }
    if (appointment.payment.status !== 'PAID') {
      throw new BadRequestException(
        'No se puede completar la cita: el pago no está en estado PAGADO',
      );
    }
    appointment.status = 'COMPLETED';
    await this.appointmentRepository.save(appointment);
    return appointment;
  }

  async getHorariosDisponibles(
    barberId: string,
    date: string,
    serviceIds: string[],
    toleranciaMin: number = 5, // minutos de tolerancia entre citas
  ): Promise<string[]> {
    // 1. Obtener barbero y configuración
    const barber = await this.barberRepository.findOneBy({ id: barberId });
    if (!barber) throw new NotFoundException('Barbero no encontrado');
    const barberConfig = await this.barberConfig.getConfig();
    if (!barberConfig)
      throw new BadRequestException('No hay configuración de barbería');

    // 2. Calcular duración total de los servicios
    const services = await this.serviceRepository.findBy({
      id: In(serviceIds),
    });
    if (!services || services.length === 0)
      throw new NotFoundException('Servicios no encontrados');
    const duracionTotal = services.reduce((sum, s) => sum + s.duration, 0);

    // 3. Definir rango de horario (el menor entre barbería y barbero)
    const open = Math.max(
      toMinutes(barberConfig.openHour),
      toMinutes(barber.startHour),
    );
    const close = Math.min(
      toMinutes(barberConfig.closeHour),
      toMinutes(barber.endHour),
    );

    // 4. Obtener citas ya agendadas para ese barbero y fecha (con servicios)
    const citas = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.services', 'service')
      .where('appointment.barberId = :barberId', { barberId })
      .andWhere('DATE(appointment.date) = :date', { date })
      .andWhere('appointment.status IN (:...status)', {
        status: ['SCHEDULED', 'PENDING'],
      })
      .getMany();

    // 5. Construir bloques ocupados de forma robusta
    const bloquesOcupados: [number, number][] = citas.map((cita) => {
      // Si no tiene totalDuration, lo calculamos sumando los servicios
      let duracion = cita.totalDuration;
      if (!duracion && cita.services && cita.services.length > 0) {
        duracion = cita.services.reduce((sum, s) => sum + s.duration, 0);
      }
      // Si aún así no hay duración, asumimos 0 (no debería pasar)
      duracion = duracion || 0;
      const inicio = toMinutes(cita.time);
      const fin = inicio + duracion + toleranciaMin;
      return [inicio, fin];
    });

    // 6. Generar bloques disponibles (ejemplo: cada 5 minutos)
    const disponibles: string[] = [];
    for (
      let min = open;
      min + duracionTotal + toleranciaMin <= close;
      min += 5
    ) {
      const inicio = min;
      const fin = inicio + duracionTotal;
      // Verifica que no se cruce con ningún bloque ocupado
      const hayConflicto = bloquesOcupados.some(
        ([ini, finOcup]) => inicio < finOcup && fin > ini,
      );
      if (!hayConflicto) {
        // Formatea a "HH:mm"
        const h = String(Math.floor(inicio / 60)).padStart(2, '0');
        const m = String(inicio % 60).padStart(2, '0');
        disponibles.push(`${h}:${m}`);
      }
    }
    return disponibles;
  }
}

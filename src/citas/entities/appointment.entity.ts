import { Barber } from "src/barberos/entities/barber.entity";
import { Client } from "src/clientes/entities/client.entity";
import { Payment } from "src/pagos/entities/payment.entity";
import { Service } from "src/servicios/entities/service.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  time: string;

  @Column()
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'PENDING';

  @Column()
  totalPrice: number;

  @Column()
  totalDuration: number;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Client, client => client.appointments)
  client: Client;

  @ManyToOne(() => Barber, barber => barber.appointments)
  barber: Barber;

  @ManyToMany(() => Service)
  @JoinTable()
  services: Service[];

  @OneToOne(() => Payment, payment => payment.appointment)
  payment: Payment;
}
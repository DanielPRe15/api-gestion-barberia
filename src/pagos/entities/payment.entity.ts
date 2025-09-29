import { Appointment } from "src/citas/entities/appointment.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  amount: number;

  @Column()
  paymentDate: Date;

  @Column()
  paymentMethod: 'CASH' | 'CARD' | 'YAPE' | 'PLIN';

  @Column()
  status: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED';

  @OneToOne(() => Appointment, appointment => appointment.payment)
  @JoinColumn()
  appointment: Appointment;
}
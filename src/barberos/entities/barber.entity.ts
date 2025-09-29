import { Appointment } from "src/citas/entities/appointment.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('barbers')
export class Barber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column()
  hireDate: Date;

  @Column("simple-array")
  workDays: string[];

  @Column({ type: 'time' })
  startHour: string;

  @Column({ type: 'time' })
  endHour: string;

  @Column()
  status: 'ACTIVE' | 'INACTIVE' | 'VACATION';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  @OneToMany(() => Appointment, appointment => appointment.barber)
  appointments: Appointment[];


}
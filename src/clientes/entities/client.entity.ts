import { Appointment } from "src/citas/entities/appointment.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('clients')
export class Client {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column()
  registrationDate: Date;

  @Column({ nullable: true })
  notes?: string;

  @Column()
  status: 'ACTIVE' | 'INACTIVE';

  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Appointment, appointment => appointment.client)
  appointments: Appointment[];
}
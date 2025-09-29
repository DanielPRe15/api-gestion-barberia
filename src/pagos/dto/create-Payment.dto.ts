import { Transform, Type } from 'class-transformer';
import { 
  IsUUID, 
  IsNumber, 
  IsDateString, 
  IsEnum,
  IsOptional,
  Min,
  Max,
  IsDate
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID('4', { message: 'El ID de la cita debe ser un UUID válido.' })
  appointmentId: string;

  @IsNumber(
    { maxDecimalPlaces: 2 }, 
    { message: 'El monto debe ser un número válido con máximo 2 decimales.' }
  )
  @Min(0.01, { message: 'El monto debe ser mayor a 0.' })
  @Max(10000, { message: 'El monto no puede ser mayor a 10,000.' })
  amount: number;

  @IsDate({ message: 'La fecha de pago debe ser una fecha válida.' })
  @Transform(({ value }) => {
    // Si viene como string, conviértelo a Date
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value;
  })
  @Type(() => Date)
  paymentDate: Date;

  @IsEnum(['CASH', 'CARD', 'YAPE', 'PLIN'], { 
    message: 'Método de pago inválido. Use: CASH, CARD, YAPE o PLIN.' 
  })
  paymentMethod: 'CASH' | 'CARD' | 'YAPE' | 'PLIN';

  @IsOptional()
  @IsEnum(['PAID', 'PENDING', 'FAILED'], { 
    message: 'Estado inválido. Use: PAID, PENDING o FAILED.' 
  })
  status?: 'PAID' | 'PENDING' | 'FAILED';
}
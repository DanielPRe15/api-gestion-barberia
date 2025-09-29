import { 
  IsUUID, 
  IsDateString, 
  IsOptional, 
  MinLength, 
  IsString,
  IsArray,
  ArrayNotEmpty,
  Matches,
  IsEnum
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAppointmentDto {
  @IsUUID('4', { message: 'El cliente debe ser un UUID válido.' })
  clientId: string;

  @IsUUID('4', { message: 'El barbero debe ser un UUID válido.' })
  barberId: string;

  @IsArray({ message: 'Los servicios deben ser un array.' })
  @ArrayNotEmpty({ message: 'Debe seleccionar al menos un servicio.' })
  @Transform(({ value }) => {
    // Convierte strings a números automáticamente
    return Array.isArray(value) ? value.map(id => parseInt(id)) : value;
  })
  serviceIds: number[];

  @IsDateString({}, { message: 'La fecha de la cita no es válida (formato: YYYY-MM-DD).' })
  date: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora debe estar en formato HH:mm (ejemplo: 14:30).'
  })
  @Transform(({ value }) => {
    // Acepta tanto "20:30" como "20:30:00" y convierte a "20:30"
    if (typeof value === 'string' && value.includes(':')) {
      const parts = value.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return value;
  })
  time: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Las notas deben tener al menos 3 caracteres.' })
  notes?: string;

 
  @IsEnum(['CASH', 'CARD', 'YAPE', 'PLIN'], { 
    message: 'Método de pago inválido. Use: CASH, CARD, YAPE o PLIN.' 
  })
  paymentMethod: 'CASH' | 'CARD' | 'YAPE' | 'PLIN';
}
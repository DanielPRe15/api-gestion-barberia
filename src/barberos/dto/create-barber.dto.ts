import { IsString, IsOptional, IsEmail, IsEnum, IsDateString, MinLength, Matches, IsArray, ArrayNotEmpty, ArrayMinSize } from 'class-validator';

export class CreateBarberDto {
  @IsString({ message: 'El nombre es obligatorio y debe ser texto.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  firstName: string;

  @IsString({ message: 'El apellido es obligatorio y debe ser texto.' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres.' })
  lastName: string;

  @Matches(/^[0-9]{9}$/, { message: 'El teléfono debe tener 9 dígitos.' })
  phone: string;

  @IsEmail({}, { message: 'El correo no es válido.' })
  email: string;

    @IsOptional()
    @IsArray({ message: 'Los días de trabajo deben ser un arreglo.' })
    @ArrayNotEmpty({ message: 'Debe especificar al menos un día de trabajo.' })
    @ArrayMinSize(1, { message: 'Debe especificar al menos un día de trabajo.' })
    @IsString({ each: true, message: 'Cada día de trabajo debe ser un texto.' })
    workDays?: string[];

  @IsString({ message: 'La hora de inicio es obligatoria y debe ser texto.' })
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, { message: 'La hora de inicio debe estar en formato HH:mm.' })
  startHour: string;

  @IsString({ message: 'La hora de fin es obligatoria y debe ser texto.' })
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, { message: 'La hora de fin debe estar en formato HH:mm.' })
  endHour: string;


  @IsDateString({}, { message: 'La fecha de contratación no es válida.' })
  hireDate: Date;

  @IsEnum(['ACTIVE', 'INACTIVE', 'VACATION'], { message: 'El estado debe ser ACTIVE, INACTIVE o VACATION.' })
  status: 'ACTIVE' | 'INACTIVE' | 'VACATION';
}

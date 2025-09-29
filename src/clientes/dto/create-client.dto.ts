import { IsString, IsOptional, IsEmail, Matches, MinLength, IsDateString, IsEnum } from 'class-validator';

export class CreateClientDto {
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

  @IsDateString({}, { message: 'La fecha de registro no es válida.' })
  registrationDate: Date;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser texto.' })
  notes?: string;

  @IsEnum(['ACTIVE', 'INACTIVE'], { message: 'El estado debe ser ACTIVE o INACTIVE.' })
  status: 'ACTIVE' | 'INACTIVE';
}

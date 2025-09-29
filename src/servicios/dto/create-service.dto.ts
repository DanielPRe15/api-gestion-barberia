import { IsString, IsOptional, MinLength, IsNumber, IsEnum, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString({ message: 'El nombre del servicio es obligatorio.' })
  @MinLength(3, { message: 'El nombre del servicio debe tener al menos 3 caracteres.' })
  name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto.' })
  description?: string;

  @IsNumber({}, { message: 'El precio debe ser un número.' })
  @Min(0, { message: 'El precio no puede ser negativo.' })
  price: number;

  @IsNumber({}, { message: 'La duración debe ser un número en minutos.' })
  @Min(1, { message: 'La duración debe ser al menos 1 minuto.' })
  duration: number;

  @IsEnum(['ACTIVE', 'INACTIVE'], { message: 'El estado debe ser ACTIVE o INACTIVE.' })
  status: 'ACTIVE' | 'INACTIVE';
}

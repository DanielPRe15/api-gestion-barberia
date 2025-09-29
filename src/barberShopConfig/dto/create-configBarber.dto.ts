import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsMilitaryTime, ArrayMinSize, IsOptional } from 'class-validator';

export class CreateConfigBarberDto {
    @IsOptional()
    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El nombre es obligatorio.' })
    name?: string;

    @IsOptional() 
    @IsString({ message: 'La dirección debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'La dirección es obligatoria.' })
    address?: string;

    @IsOptional()
    @IsString({ message: 'La hora de apertura debe ser una cadena de texto.' })
    @IsMilitaryTime({ message: 'La hora de apertura debe estar en formato HH:mm.' })
    openHour?: string;

    @IsOptional()
    @IsString({ message: 'La hora de cierre debe ser una cadena de texto.' })
    @IsMilitaryTime({ message: 'La hora de cierre debe estar en formato HH:mm.' })
    closeHour?: string;

    @IsOptional()
    @IsArray({ message: 'Los días de trabajo deben ser un arreglo.' })
    @ArrayNotEmpty({ message: 'Debe especificar al menos un día de trabajo.' })
    @ArrayMinSize(1, { message: 'Debe especificar al menos un día de trabajo.' })
    @IsString({ each: true, message: 'Cada día de trabajo debe ser un texto.' })
    workDays?: string[];
}
import { Transform } from "class-transformer";
import { IsEmail, IsString, Min, MinLength } from "class-validator";

export class RegisterDto {

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres.' })
    name: string;

    @IsEmail({}, { message: 'Debe ser un email válido' })
    email: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    password: string;
}
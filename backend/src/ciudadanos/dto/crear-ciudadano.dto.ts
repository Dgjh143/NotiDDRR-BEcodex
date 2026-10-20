
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CrearCiudadanoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidos!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(25)
  ci!: string;

  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: 'El WhatsApp debe contener entre 7 y 15 dígitos',
  })
  whatsapp!: string;

  @IsBoolean()
  aceptaNotificaciones!: boolean;
}

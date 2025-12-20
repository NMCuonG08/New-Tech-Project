import { IsNumber, IsNotEmpty, IsEnum, IsOptional, IsString, IsBoolean } from "class-validator";
import { AlertType } from "../entities/Alert";

export class CreateAlertDto {
  @IsNumber()
  @IsNotEmpty()
  locationId!: number;

  @IsEnum(AlertType)
  @IsNotEmpty()
  type!: AlertType;

  @IsNumber()
  @IsOptional()
  threshold?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateAlertDto {
  @IsEnum(AlertType)
  @IsOptional()
  type?: AlertType;

  @IsNumber()
  @IsOptional()
  threshold?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

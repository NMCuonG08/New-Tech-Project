import { IsNumber, IsNotEmpty, IsString, IsDateString, IsOptional } from "class-validator";

export class CreateNoteDto {
  @IsNumber()
  @IsNotEmpty()
  locationId!: number;

  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class UpdateNoteDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsNumber()
  @IsOptional()
  locationId?: number;
}

import { IsString, IsOptional, IsEmail, MinLength, ValidateIf } from "class-validator";

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  username?: string;

  @ValidateIf((o) => o.email !== '' && o.email !== null && o.email !== undefined)
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  currentPassword!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;
}

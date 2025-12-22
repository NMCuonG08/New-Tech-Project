import { IsString, IsNotEmpty, IsOptional, MinLength, ValidateIf } from "class-validator";
import { Transform, Type } from "class-transformer";

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty({ message: "Message is required" })
  @MinLength(1, { message: "Message cannot be empty" })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.trim();
    }
    return value;
  })
  message!: string;

  @Transform(({ value }) => {
    // If no value provided, return undefined to let backend generate UUID
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    return typeof value === "string" ? value.trim() : value;
  })
  @IsOptional()
  @ValidateIf((o) => o.sessionId !== undefined && o.sessionId !== null && o.sessionId !== "")
  @IsString()
  sessionId?: string;
}

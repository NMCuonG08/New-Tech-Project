import { IsString, IsNotEmpty, IsOptional, MinLength } from "class-validator";
import { Transform } from "class-transformer";

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

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === "") {
      return "default-session";
    }
    return typeof value === "string" ? value.trim() : value;
  })
  sessionId?: string;
}


import { IsString, IsNotEmpty, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class SessionIdParamDto {
  @IsString()
  @IsNotEmpty({ message: "Session ID is required" })
  @MinLength(1, { message: "Session ID cannot be empty" })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.trim();
    }
    return value;
  })
  sessionId!: string;
}

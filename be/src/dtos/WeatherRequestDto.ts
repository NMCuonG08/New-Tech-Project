import { IsString, IsNotEmpty, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class WeatherRequestDto {
  @IsString()
  @IsNotEmpty({ message: "City is required" })
  @MinLength(1, { message: "City cannot be empty" })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value.trim();
    }
    return value;
  })
  city!: string;
}

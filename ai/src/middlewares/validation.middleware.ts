import { Request, Response, NextFunction } from "express";
import { validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";

export function validateDto<T extends object>(
  dtoClass: new () => T,
  source: "body" | "params" | "query" = "body"
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if dtoClass is valid
      if (!dtoClass || typeof dtoClass !== "function") {
        return res.status(500).json({
          success: false,
          error: "Validation middleware error",
          message: "Invalid DTO class provided",
        });
      }

      // Get data from request (body, params, or query)
      let data: any;
      if (source === "body") {
        data = req.body || {};
      } else if (source === "params") {
        data = req.params || {};
      } else {
        data = req.query || {};
      }

      // Ensure data is an object
      if (typeof data !== "object" || Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: [
            {
              property: source,
              value: data,
              constraints: [`${source} must be an object`],
            },
          ],
        });
      }

      // Transform plain object to DTO instance
      const dto = plainToInstance(dtoClass, data || {}, {
        enableImplicitConversion: true,
        excludeExtraneousValues: false,
      });

      // Validate
      const errors: ValidationError[] = await validate(dto as object, {
        whitelist: true,
        forbidNonWhitelisted: false,
      });

      if (errors.length > 0) {
        // Format validation errors
        const formattedErrors = errors.map((error) => {
          const constraints = error.constraints || {};
          return {
            property: error.property,
            value: error.value,
            constraints: Object.values(constraints),
          };
        });

        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: formattedErrors,
        });
      }

      // Attach validated and transformed DTO to request
      (req as any).dto = dto;
      next();
    } catch (error) {
      console.error("Validation middleware error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Validation error";
      const errorStack = error instanceof Error ? error.stack : undefined;
      return res.status(500).json({
        success: false,
        error: "Validation middleware error",
        message: errorMessage,
        ...(process.env.NODE_ENV === "development" && { stack: errorStack }),
      });
    }
  };
}


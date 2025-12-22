import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../entities/User";

interface JWTPayload {
  id: number;
  username: string;
  email: string;
  role: string;
}

/**
 * Optional auth middleware - extracts user from token if present
 * Does NOT return 401 if token is missing (for anonymous users)
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    // No token - continue as anonymous user
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = decoded as any as User;
    next();
  } catch (err) {
    // Invalid token - continue as anonymous but log warning
    console.warn("Invalid token provided:", err);
    next();
  }
};

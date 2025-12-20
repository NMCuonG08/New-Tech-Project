import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../entities/User";

interface JWTPayload {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = decoded as any as User;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
};
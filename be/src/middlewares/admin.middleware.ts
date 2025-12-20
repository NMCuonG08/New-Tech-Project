import { Request, Response, NextFunction } from "express";
import { UserRole } from "../entities/User";

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: "Access denied. Admin role required." });
  }

  next();
};

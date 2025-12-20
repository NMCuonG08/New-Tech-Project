import { Request, Response } from "express";
import { AuthService } from "../services/authService";

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username và password là bắt buộc" });
    }

    const user = await authService.register(username, password);
    return res.status(201).json({ 
      id: user.id, 
      username: user.username,
      role: user.role 
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Register failed" });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role
  });
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username và password là bắt buộc" });
    }

    const { user, token } = await authService.login(username, password);
    // Temporarily return flat structure to match what's currently working
    return res.json({ 
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token 
    });
  } catch (err: any) {
    return res.status(401).json({ message: err.message || "Login failed" });
  }
};

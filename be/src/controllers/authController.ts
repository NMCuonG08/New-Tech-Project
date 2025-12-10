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
    return res.status(201).json({ id: user.id, username: user.username });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Register failed" });
  }
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
    return res
      .status(200)
      .json({ id: user.id, username: user.username, token });
  } catch (err: any) {
    return res.status(401).json({ message: err.message || "Login failed" });
  }
};

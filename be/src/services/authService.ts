import { userRepository } from "../repositories/UserRepository";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";

export class AuthService {
  async register(username: string, password: string): Promise<User> {
    const existing = await userRepository.findOne({ where: { username } });
    if (existing) {
      throw new Error("User already exists");
    }

    const user = userRepository.create({ username, password });
    return userRepository.save(user);
  }

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const user = await userRepository.findOne({ where: { username } });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if user has a password (not an OAuth user)
    if (!user.password) {
      throw new Error("This account uses OAuth login. Please sign in with Google.");
    }

    // Verify password
    if (user.password !== password) {
      throw new Error("Invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role 
      }, 
      process.env.JWT_SECRET!, 
      { expiresIn: "1h" }
    );

    return { user, token };
  }
}

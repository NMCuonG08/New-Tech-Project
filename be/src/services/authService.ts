import { userRepository } from "../repositories/UserRepository";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";
import { Not } from "typeorm";

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
      { expiresIn: "1d" }
    );

    return { user, token };
  }

  async updateProfile(userId: number, updates: { username?: string; email?: string }): Promise<User> {
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    // Check if username is being changed and is unique
    if (updates.username && updates.username !== user.username) {
      const existingUsername = await userRepository.findOne({ 
        where: { username: updates.username, id: Not(userId) } 
      });
      if (existingUsername) {
        throw new Error("Username already taken");
      }
      user.username = updates.username;
    }

    // Check if email is being changed and is unique
    if (updates.email !== undefined && updates.email !== user.email) {
      if (updates.email) {
        const existingEmail = await userRepository.findOne({ 
          where: { email: updates.email, id: Not(userId) } 
        });
        if (existingEmail) {
          throw new Error("Email already taken");
        }
      }
      user.email = updates.email || undefined;
    }

    return userRepository.save(user);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has a password (not an OAuth-only user)
    if (!user.password) {
      throw new Error("Cannot change password for OAuth-only accounts");
    }

    // Verify current password
    if (user.password !== currentPassword) {
      throw new Error("Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await userRepository.save(user);
  }
}

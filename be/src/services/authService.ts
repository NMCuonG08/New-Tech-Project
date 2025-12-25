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
    console.log('🔐 Login attempt:', { username, password: password ? '***' : 'empty' });
    
    const user = await userRepository.findOne({ where: { username } });
    if (!user) {
      console.log('❌ User not found:', username);
      throw new Error("Invalid credentials");
    }

    console.log('👤 User found:', { 
      id: user.id, 
      username: user.username, 
      hasPassword: !!user.password,
      passwordMatch: user.password === password 
    });

    // Check if user has a password (not an OAuth user)
    if (!user.password) {
      console.log('❌ OAuth user trying password login');
      throw new Error("This account uses OAuth login. Please sign in with Google.");
    }

    // Verify password
    if (user.password !== password) {
      console.log('❌ Password mismatch');
      throw new Error("Invalid credentials");
    }

    console.log('✅ Login successful for:', username);

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

    console.log('📝 Update profile request:', {
      userId,
      currentUsername: user.username,
      newUsername: updates.username,
      currentEmail: user.email,
      newEmail: updates.email,
      isOAuthUser: !!user.googleId
    });

    // Check if username is already taken by another user
    if (updates.username && updates.username !== user.username) {
      const existing = await userRepository.findOne({ where: { username: updates.username } });
      if (existing) {
        throw new Error("Username already taken");
      }
      user.username = updates.username;
    }

    // OAuth users cannot change their email
    if (updates.email !== undefined && updates.email !== user.email) {
      if (user.googleId) {
        throw new Error("OAuth accounts cannot change their email address");
      }
      // Convert empty string to null to avoid unique constraint issues
      user.email = updates.email === '' ? null : updates.email;
    }

    const saved = await userRepository.save(user);
    console.log('✅ Profile updated:', {
      id: saved.id,
      username: saved.username,
      email: saved.email
    });
    
    return saved;
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    console.log('🔐 User found:', {
      userId: user.id,
      hasPassword: !!user.password,
      passwordMatch: user.password === currentPassword
    });

    // Check if user has a password (not an OAuth user)
    if (!user.password) {
      throw new Error("This account uses OAuth login and cannot change password.");
    }

    // Verify current password
    if (user.password !== currentPassword) {
      throw new Error("Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await userRepository.save(user);
    console.log('✅ Password updated successfully in database');
  }
}

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

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { username, email } = req.body;
    
    console.log('📝 Profile update request:', {
      userId,
      username,
      email
    });
    
    const updatedUser = await authService.updateProfile(userId, { username, email });

    console.log('✅ Profile updated successfully:', updatedUser);
    
    return res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (err: any) {
    console.error('❌ Profile update error:', err.message);
    if (err.message === "Username already taken") {
      return res.status(400).json({ message: err.message });
    }
    if (err.message.includes("OAuth")) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;
    
    console.log('🔑 Change password request:', {
      userId,
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword,
      currentPasswordLength: currentPassword?.length,
      newPasswordLength: newPassword?.length
    });
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    await authService.changePassword(userId, currentPassword, newPassword);
    
    console.log('✅ Password changed successfully for user:', userId);
    return res.json({ message: "Password changed successfully" });
  } catch (err: any) {
    console.error('❌ Change password error:', err.message);
    if (err.message === "Current password is incorrect") {
      return res.status(400).json({ message: err.message });
    }
    if (err.message.includes("OAuth")) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Failed to change password" });
  }
};

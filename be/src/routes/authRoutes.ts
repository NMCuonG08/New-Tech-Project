import { Router } from "express";
import { register, login, getCurrentUser, updateProfile, changePassword } from "../controllers/authController";
import { verifyToken } from "../middlewares/auth.middleware";
import { validateDto } from "../middlewares/validation.middleware";
import { UpdateProfileDto, ChangePasswordDto } from "../dtos/UpdateProfileDto";
import passport from "passport";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getCurrentUser);

// Profile update routes
router.put("/profile", verifyToken, validateDto(UpdateProfileDto), updateProfile);
router.post("/change-password", verifyToken, validateDto(ChangePasswordDto), changePassword);

router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route." });
});

// Google OAuth2 route
router.get(
  "/google",
  (req, res, next) => {
    // Store mode (login or register) in session
    const mode = req.query.mode as string || 'register';
    (req.session as any).oauthMode = mode;
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google OAuth2 callback route
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", (err: any, user: any, info: any) => {
      // Always prioritize FRONTEND_URL from env, fallback to defaults
      const frontendUrl = process.env.FRONTEND_URL 
        || (process.env.NODE_ENV === 'production' 
          ? 'https://new-tech-project.vercel.app' 
          : 'http://localhost:5173');
      
      console.log('🔗 OAuth redirect URL:', frontendUrl, '| NODE_ENV:', process.env.NODE_ENV, '| FRONTEND_URL env:', process.env.FRONTEND_URL);
      
      if (err) {
        console.error('OAuth error:', err);
        return res.redirect(`${frontendUrl}?auth=error&message=${encodeURIComponent('Authentication error occurred')}`);
      }
      
      if (!user) {
        // User not found or authentication failed
        const message = info?.message || 'Authentication failed';
        console.log('OAuth authentication failed:', message);
        return res.redirect(`${frontendUrl}?auth=error&message=${encodeURIComponent(message)}`);
      }
      
      // Successful authentication
      console.log('OAuth User from Passport:', user);
      
      // Generate JWT token for OAuth user
      const jwt = require("jsonwebtoken");
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          email: user.email,
          role: user.role 
        }, 
        process.env.JWT_SECRET || "your_secret_key", 
        { expiresIn: "7d" }
      );
      
      // Clear the oauthMode from session
      delete (req.session as any).oauthMode;
      
      // Create response data
      const authData = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      };
      
      // Redirect to frontend with token and user data
      res.redirect(`${frontendUrl}?auth=success&data=${encodeURIComponent(JSON.stringify(authData))}`);
    })(req, res, next);
  }
);

export default router;

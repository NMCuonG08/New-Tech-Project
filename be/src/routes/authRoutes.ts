import { Router } from "express";
import { register, login } from "../controllers/authController";
import { verifyToken } from "../middlewares/auth.middleware";
import passport from "passport";

const router = Router();

router.post("/register", register);
router.post("/login", login);
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
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      
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
      
      // Clear the oauthMode from session
      delete (req.session as any).oauthMode;
      
      // Redirect to root with auth success query params
      res.redirect(`${frontendUrl}?auth=success&user=${encodeURIComponent(JSON.stringify(user))}`);
    })(req, res, next);
  }
);

export default router;

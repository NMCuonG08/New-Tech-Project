import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: (() => {
        // Use OAUTH_CALLBACK_URL if explicitly set (highest priority)
        if (process.env.OAUTH_CALLBACK_URL) {
          return process.env.OAUTH_CALLBACK_URL;
        }
        // Use BACKEND_URL from environment (works for both production and development)
        return `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/google/callback`;
      })(),
      passReqToCallback: true,
    },
    async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const userRepository = AppDataSource.getRepository(User);
        const email = profile.emails?.[0]?.value || '';
        const googleId = profile.id;
        const mode = req.session?.oauthMode || 'register'; // Default to register for backward compatibility
        
        // Generate username from email (before @)
        const username = email.split('@')[0];
        
        // Find existing user by googleId or email
        let user = await userRepository.findOne({ 
          where: [{ googleId }, { email }] 
        });
        
        if (!user) {
          if (mode === 'login') {
            // User doesn't exist and trying to login
            return done(null, false, { message: 'No account found. Please register first.' });
          }
          // Create new user only in register mode
          user = userRepository.create({
            username,
            email,
            googleId,
          });
          await userRepository.save(user);
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done: any) => {
  done(null, user);
});

passport.deserializeUser((user: any, done: any) => {
  done(null, user);
});
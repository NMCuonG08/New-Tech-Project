import { Router } from "express";
import { register, login } from "../controllers/authController";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route." });
});

export default router;

import { Router } from "express";
import usersController, { UserLoginSchema, UserRegisterSchema } from "../controllers/auth.controller";
import authenticateToken from "../middlewares/authenticateToken";
import authorizedRoles from "../middlewares/authorizedRoles";
import { validate } from "../middlewares/validate";
import { authLimiter } from "../middlewares/rateLimiter";

const router = Router();
router.post("/register", validate(UserRegisterSchema), authenticateToken, authorizedRoles(["ADMIN"]), usersController.addUser);
router.post("/login", authLimiter, validate(UserLoginSchema), usersController.loginUser);
router.get(
  "/me",
  authenticateToken,
  authorizedRoles(["ADMIN", "JURY"]),
  usersController.getMe,
);

export default router;

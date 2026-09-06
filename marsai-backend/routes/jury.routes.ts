import { Router } from "express";
import juryController from "../controllers/jury.controller";
import authenticateToken from "../middlewares/authenticateToken";
import authorizedRoles from "../middlewares/authorizedRoles";

const router = Router();

router.get("/rating/count", authenticateToken, authorizedRoles(["ADMIN", "JURY"]), juryController.getRatingCount);

export default router;

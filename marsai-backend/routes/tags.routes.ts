import { Router } from "express";
import tagsController from "../controllers/tags.controller";
import authenticateToken from "../middlewares/authenticateToken";
import authorizedRoles from "../middlewares/authorizedRoles";

const router = Router();

router.get("/:category", tagsController.getAllTags);
router.post("/", authenticateToken, authorizedRoles(["ADMIN", "JURY"]), tagsController.addTag);

export default router;


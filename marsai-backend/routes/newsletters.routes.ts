import { Router } from "express";
import {
  addNewsletter,
  getAllNewsletters,
  sendNewsletterByIdToAllSubscribers,
} from "../controllers/newsletters.controller";
import authorizedRoles from "../middlewares/authorizedRoles";
import authenticateToken from "../middlewares/authenticateToken";

const router = Router();

router.get(
  "/",
  authenticateToken,
  authorizedRoles(["ADMIN"]),
  getAllNewsletters,
);

router.post("/", authenticateToken, authorizedRoles(["ADMIN"]), addNewsletter);
router.post(
  "/send",
  authenticateToken,
  authorizedRoles(["ADMIN"]),
  sendNewsletterByIdToAllSubscribers,
);
export default router;

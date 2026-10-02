import { Router } from "express";
import subscribersController from "../controllers/subscribers.controller";
import authenticateToken from "../middlewares/authenticateToken";
import authorizedRoles from "../middlewares/authorizedRoles";
import { emailActionLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.get("/", authenticateToken, authorizedRoles(["ADMIN"]), subscribersController.getAllSubscribers);
router.delete("/:id", authenticateToken, authorizedRoles(["ADMIN"]), subscribersController.deleteSubscriberById);
router.post("/subscribe", emailActionLimiter, subscribersController.subscribeNewsletter);
router.get("/unsubscribe/:token", subscribersController.unsubscribeNewsletter);

export default router;

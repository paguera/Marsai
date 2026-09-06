import { Router } from "express";
import subscribersController from "../controllers/subscribers.controller";
import authenticateToken from "../middlewares/authenticateToken";
import authorizedRoles from "../middlewares/authorizedRoles";

const router = Router();

router.get("/", authenticateToken, authorizedRoles(["ADMIN"]), subscribersController.getAllSubscribers);
router.delete("/:id", authenticateToken, authorizedRoles(["ADMIN"]), subscribersController.deleteSubscriberById);
router.post("/subscribe", subscribersController.subscribeNewsletter);
router.get("/unsubscribe/:token", subscribersController.unsubscribeNewsletter);

export default router;

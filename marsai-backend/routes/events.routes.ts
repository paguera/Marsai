import { Router } from "express";
import eventsController, { CreateReservationSchema } from "../controllers/events.controller";
import { validate } from "../middlewares/validate";
import authenticateToken from "../middlewares/authenticateToken";
import authorizedRoles from "../middlewares/authorizedRoles";

const router = Router();

router.get("/", eventsController.getAll);
router.get("/bookings", authenticateToken, authorizedRoles(["ADMIN"]), eventsController.getReservations);
router.post("/book", validate(CreateReservationSchema), eventsController.addReservation);
router.get("/unbook/:token", eventsController.removeReservation);
router.get("/:id", eventsController.getOne);
router.get("/stats/count", eventsController.getParticipantSum);

export default router;

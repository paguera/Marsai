import { Router } from "express";
import adminController from "../controllers/admin.controller";
import authorizedRoles from "../middlewares/authorizedRoles";
import authenticateToken from "../middlewares/authenticateToken";
import moviesController from "../controllers/movies.controller";
import eventsController, { CreateEventSchema } from "../controllers/events.controller";
import { validate } from "../middlewares/validate";

const router = Router();

router.delete(
  "/event/:id",
  authenticateToken,
  authorizedRoles(["ADMIN"]),
  adminController.deleteEvent,
);
router.post(
  "/promote/jury/:userId",
  authenticateToken,
  authorizedRoles(["ADMIN"]),
  adminController.promoteToJury,
);
router.post(
  "/promote/admin/:userId",
  authenticateToken,
  authorizedRoles(["ADMIN"]),
  adminController.promoteToAdmin,
);
router.get(
  "/users",
  authenticateToken,
  authorizedRoles(["ADMIN"]),
  adminController.getAllUsers,
);
router.delete(
  "/users/:id",
  authenticateToken,
  authorizedRoles(["ADMIN"]),
  adminController.deleteUser,
);
router.put(
  "/movie-status/:id",
  authenticateToken,
  authorizedRoles(["ADMIN", "JURY"]),
  moviesController.changeMovieStatus,
);

router.post(
  "/event",
  authenticateToken,
  authorizedRoles(["ADMIN"]),
  validate(CreateEventSchema),
  eventsController.addEvent,
);

export default router;

import { Router } from "express";
import { UsersController } from "@/controllers/users-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";

const usersRoutes = Router();
const usersController = new UsersController();

usersRoutes.post("/", usersController.create);

usersRoutes.use(ensureAuthenticated);
usersRoutes.delete("/", usersController.delete);
usersRoutes.patch("/", usersController.update);

export { usersRoutes };

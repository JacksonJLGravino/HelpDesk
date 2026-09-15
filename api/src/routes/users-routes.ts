import { Router } from "express";
import { UsersController } from "@/controllers/users-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import multer from "multer";
import uploadConfig from "@/configs/upload";

const usersRoutes = Router();
const usersController = new UsersController();
const upload = multer(uploadConfig.MULTER);

usersRoutes.post("/", usersController.create);

usersRoutes.use(ensureAuthenticated);
usersRoutes.delete("/", usersController.delete);
usersRoutes.patch("/", upload.single("avatar"), usersController.update);

export { usersRoutes };

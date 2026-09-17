import { Router } from "express";
import { AvatarController } from "@/controllers/avatar-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import multer from "multer";
import uploadConfig from "@/configs/upload";

const avatarRoutes = Router();
const avatarController = new AvatarController();
const upload = multer(uploadConfig.MULTER);

avatarRoutes.use(ensureAuthenticated);
avatarRoutes.patch("/", upload.single("avatar"), avatarController.update);
avatarRoutes.delete("/", avatarController.delete);

export { avatarRoutes };

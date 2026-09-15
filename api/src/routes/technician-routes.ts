import { Router } from "express";
import { TechnicianController } from "@/controllers/technician-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";

const technicianRoutes = Router();
const technicianController = new TechnicianController();

technicianRoutes.use(ensureAuthenticated, verifyUserAuthorization(["admin"]));
technicianRoutes.post("/", technicianController.create);
technicianRoutes.get("/", technicianController.index);
technicianRoutes.patch("/:id", technicianController.update);

export { technicianRoutes };

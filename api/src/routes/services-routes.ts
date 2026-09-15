import { Router } from "express";
import { ServicesController } from "@/controllers/services-controller";

import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";

const servicesRoutes = Router();
const servicesController = new ServicesController();

servicesRoutes.get(
  "/available",
  ensureAuthenticated,
  verifyUserAuthorization(["cliente"]),
  servicesController.available,
);

servicesRoutes.use(ensureAuthenticated, verifyUserAuthorization(["admin"]));
servicesRoutes.post("/", servicesController.create);
servicesRoutes.get("/", servicesController.index);
servicesRoutes.patch("/:id", servicesController.update);

export { servicesRoutes };

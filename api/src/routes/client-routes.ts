import { Router } from "express";
import { ClientController } from "@/controllers/client-controller";

import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";

const clientRoutes = Router();
const clientController = new ClientController();

clientRoutes.use(ensureAuthenticated, verifyUserAuthorization(["admin"]));
clientRoutes.get("/", clientController.index);
clientRoutes.patch("/:id", clientController.update);
clientRoutes.delete("/:id", clientController.delete);

export { clientRoutes };

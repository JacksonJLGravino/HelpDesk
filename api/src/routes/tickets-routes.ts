import { Router } from "express";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verify-user-authorization";
import { TicketsController } from "@/controllers/ticket-controller";
import { TicketServiceController } from "@/controllers/ticket-service-controller";

const ticketsRoutes = Router();
const ticketsController = new TicketsController();
const ticketServiceController = new TicketServiceController();

ticketsRoutes.use(ensureAuthenticated);
ticketsRoutes.post(
  "/",
  verifyUserAuthorization(["cliente"]),
  ticketsController.create,
);
ticketsRoutes.get(
  "/",
  verifyUserAuthorization(["cliente", "admin", "tecnico"]),
  ticketsController.index,
);
ticketsRoutes.get(
  "/:ticketId",
  verifyUserAuthorization(["cliente", "admin", "tecnico"]),
  ticketsController.show,
);
ticketsRoutes.patch(
  "/:ticketId",
  verifyUserAuthorization(["tecnico"]),
  ticketsController.update,
);
ticketsRoutes.delete(
  "/:ticketId/:ticketServiceId",
  verifyUserAuthorization(["tecnico"]),
  ticketServiceController.delete,
);
ticketsRoutes.patch(
  "/:ticketId/:technicianId",
  verifyUserAuthorization(["admin"]),
  ticketsController.assignTechnician,
);

export { ticketsRoutes };

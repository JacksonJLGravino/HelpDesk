import { Router } from "express";
import { usersRoutes } from "./users-routes";
import { sessionsRoutes } from "./sessions-routes";
import { servicesRoutes } from "./services-routes";
import { technicianRoutes } from "./technician-routes";
import { clientRoutes } from "./client-routes";
import { ticketsRoutes } from "./tickets-routes";

const routes = Router();
routes.use("/users", usersRoutes);
routes.use("/sessions", sessionsRoutes);
routes.use("/services", servicesRoutes);
routes.use("/technicians", technicianRoutes);
routes.use("/clients", clientRoutes);
routes.use("/tickets", ticketsRoutes);

export { routes };

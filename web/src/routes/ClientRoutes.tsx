import { Routes, Route } from "react-router";
import { NotFound } from "../pages/NotFound";
import { ClientTickets } from "../pages/client/ClientTickets";
import { DashboardLayout } from "../layout/DashboardLayout";
import { CreateTicket } from "../pages/client/CreateTicket";
import { TicketDetail } from "../pages/client/TicketDetail";

export function ClientRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route path="/" element={<ClientTickets />} />
        <Route path="/:id" element={<TicketDetail />} />
        <Route path="/create" element={<CreateTicket />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

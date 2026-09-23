import { Routes, Route } from "react-router";
import { NotFound } from "../pages/NotFound";
import { TechnicianTickets } from "../pages/technician/TechnicianTickets";
import { DashboardLayout } from "../layout/DashboardLayout";
import { TicketDetail } from "../pages/technician/TicketDetail";

export function TechnicianRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route path="/" element={<TechnicianTickets />} />
        <Route path="/:id" element={<TicketDetail />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

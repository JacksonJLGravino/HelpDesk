import { Routes, Route } from "react-router";
import { Tickets } from "../pages/admin/Tickets";
import { NotFound } from "../pages/NotFound";
import { DashboardLayout } from "../layout/DashboardLayout";
import { Technicians } from "../pages/admin/Technicians";
import { Clients } from "../pages/admin/Clients";
import { Services } from "../pages/admin/Services";
import { TicketDetail } from "../pages/admin/TicketDetail";
import { EditTechnician } from "../pages/admin/EditTechnician";
import { NewTechnician } from "../pages/admin/NewTechnician";

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route path="/" element={<Tickets />} />
        <Route path="/:id" element={<TicketDetail />} />
        <Route path="/technicians" element={<Technicians />} />
        <Route path="technicians/:id" element={<EditTechnician />} />
        <Route path="/technicians/new" element={<NewTechnician />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/services" element={<Services />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

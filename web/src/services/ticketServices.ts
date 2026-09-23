import { api } from "./api";
import type { StatusType } from "../components/Status";

export type TicketServiceItem = {
  id: number;
  name: string;
  price: string;
};

export type Ticket = {
  id: number;
  clientId: string;
  technicianId: string | null;
  serviceId: number;
  title: string;
  description: string | null;
  basePrice: string;
  finalPrice: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  service: { title: string };
  ticketServices?: TicketServiceItem[];
  client?: { name: string; email?: string; img: string | null };
  technician?: {
    id: string;
    name: string;
    email?: string;
    img: string | null;
  } | null;
};

export async function listTickets(): Promise<Ticket[]> {
  const response = await api.get("/tickets");
  return response.data;
}

export async function getTicket(id: number): Promise<Ticket> {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
}

export async function assignTechnician(
  ticketId: number,
  technicianId: string,
): Promise<Ticket> {
  const response = await api.patch(`/tickets/${ticketId}/${technicianId}`);
  return response.data;
}

export async function updateTicket(
  ticketId: number,
  data: {
    status?: "aberto" | "em_atendimento" | "encerrado";
    services?: { name: string; price: number }[];
  },
): Promise<Ticket> {
  const response = await api.patch(`/tickets/${ticketId}`, data);
  return response.data;
}

export async function removeTicketService(
  ticketId: number,
  ticketServiceId: number,
): Promise<void> {
  await api.delete(`/tickets/${ticketId}/${ticketServiceId}`);
}

export function formatTicketCode(id: number): string {
  return id.toString().padStart(5, "0");
}

export function mapTicketStatus(status: string): StatusType {
  switch (status) {
    case "aberto":
      return "open";
    case "em_atendimento":
      return "progress";
    case "encerrado":
      return "done";
    default:
      return "open";
  }
}

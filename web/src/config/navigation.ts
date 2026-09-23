import { Briefcase, ClipboardList, Plus, Users, Wrench } from "lucide-react";
import type { NavItem } from "../types/navigation";

export const NAV_ITEMS_BY_ROLE: Record<UserAPIRole, NavItem[]> = {
  admin: [
    { label: "Chamados", to: "/", icon: ClipboardList },
    { label: "Técnicos", to: "/technicians", icon: Users },
    { label: "Clientes", to: "/clients", icon: Briefcase },
    { label: "Serviços", to: "/services", icon: Wrench },
  ],
  cliente: [
    { label: "Meus chamados", to: "/", icon: ClipboardList },
    { label: "Criar chamado", to: "/create", icon: Plus },
  ],
  tecnico: [{ label: "Meus chamados", to: "/", icon: ClipboardList }],
};

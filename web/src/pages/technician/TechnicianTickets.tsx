import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { TicketCard } from "../../components/TicketCard";
import { Status, type StatusType } from "../../components/Status";
import {
  listTickets,
  updateTicket,
  formatTicketCode,
  mapTicketStatus,
  type Ticket,
} from "../../services/ticketServices";
import { getAssetUrl } from "../../utils/getAssetUrl";
import { formatDateTime } from "../../utils/formatDateTime";

function formatCurrency(price: string) {
  return Number(price).toFixed(2).replace(".", ",");
}

const SECTIONS: { status: StatusType; rawStatus: string }[] = [
  { status: "progress", rawStatus: "em_atendimento" },
  { status: "open", rawStatus: "aberto" },
  { status: "done", rawStatus: "encerrado" },
];

export function TechnicianTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setLoading] = useState(true);

  const navigate = useNavigate();

  async function loadTickets() {
    setLoading(true);
    try {
      const data = await listTickets();
      setTickets(data);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function handleStart(ticket: Ticket) {
    try {
      await updateTicket(ticket.id, { status: "em_atendimento" });
      await loadTickets();
    } catch {
      alert("Não foi possível iniciar o atendimento.");
    }
  }

  async function handleFinish(ticket: Ticket) {
    try {
      await updateTicket(ticket.id, { status: "encerrado" });
      await loadTickets();
    } catch {
      alert("Não foi possível encerrar o chamado.");
    }
  }

  return (
    <div>
      <h1 className="mt-2 mb-4 md:mb-6 md:mt-8 text-2xl font-bold text-blue-dark">
        Meus chamados
      </h1>

      {SECTIONS.map((section) => {
        const sectionTickets = tickets.filter(
          (ticket) => ticket.status === section.rawStatus,
        );

        if (sectionTickets.length === 0) return null;

        return (
          <div key={section.status} className="mb-8">
            <div className="mb-4">
              <Status type={section.status} />
            </div>

            <div className="flex flex-wrap justify-center items-center gap-4 md:justify-start">
              {sectionTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  code={formatTicketCode(ticket.id)}
                  title={ticket.title}
                  serviceName={ticket.service?.title ?? ""}
                  date={formatDateTime(ticket.updatedAt)}
                  price={formatCurrency(ticket.finalPrice ?? ticket.basePrice)}
                  clientName={ticket.client?.name ?? ""}
                  clientAvatarUrl={getAssetUrl(ticket.client?.img ?? undefined)}
                  status={mapTicketStatus(ticket.status)}
                  onEdit={() => {
                    navigate(`/${ticket.id}`);
                  }}
                  onStart={
                    section.rawStatus === "aberto"
                      ? () => handleStart(ticket)
                      : undefined
                  }
                  onFinish={
                    section.rawStatus === "em_atendimento"
                      ? () => handleFinish(ticket)
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        );
      })}

      {!isLoading && tickets.length === 0 && (
        <p className="px-6 py-10 text-center text-sm text-gray-400">
          Nenhum chamado atribuído a você ainda.
        </p>
      )}
    </div>
  );
}

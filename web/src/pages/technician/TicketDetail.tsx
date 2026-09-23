import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CircleCheckBig, Clock2, Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/Button";
import { Status } from "../../components/Status";
import { AvatarImg } from "../../components/AvatarImg";
import { ServiceItemModal } from "../../components/ServiceItemModal";
import {
  getTicket,
  updateTicket,
  removeTicketService,
  formatTicketCode,
  mapTicketStatus,
  type Ticket,
} from "../../services/ticketServices";
import { getAssetUrl } from "../../utils/getAssetUrl";
import { formatDateTime } from "../../utils/formatDateTime";

function formatCurrency(price: string) {
  return Number(price).toFixed(2).replace(".", ",");
}

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isAddServiceOpen, setAddServiceOpen] = useState(false);

  async function loadTicket() {
    if (!id) return;

    setLoading(true);
    try {
      const data = await getTicket(Number(id));
      setTicket(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [id]);

  async function handleChangeStatus(status: "em_atendimento" | "encerrado") {
    if (!ticket) return;

    try {
      await updateTicket(ticket.id, { status });
      await loadTicket();
    } catch {
      alert("Não foi possível atualizar o status do chamado.");
    }
  }

  async function handleAddService(data: { name: string; price: number }) {
    if (!ticket) return;
    await updateTicket(ticket.id, { services: [data] });
    await loadTicket();
  }

  async function handleRemoveService(ticketServiceId: number) {
    if (!ticket) return;

    try {
      await removeTicketService(ticket.id, ticketServiceId);
      await loadTicket();
    } catch {
      alert("Não foi possível remover o serviço adicional.");
    }
  }

  if (isLoading) {
    return <p className="p-8 text-center text-gray-400">Carregando...</p>;
  }

  if (!ticket) {
    return (
      <p className="p-8 text-center text-gray-400">Chamado não encontrado.</p>
    );
  }

  const ticketServicesList = ticket.ticketServices ?? [];
  const isOpen = ticket.status === "aberto";
  const isInProgress = ticket.status === "em_atendimento";
  const isDone = ticket.status === "encerrado";

  return (
    <div>
      <div className="flex items-center justify-between mb-4 mt-1 md:mb-6 md:mt-8">
        <div>
          <Button
            color="link"
            size="sm"
            className="flex px-0 gap-2 items-center"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Button>
          <h1 className="text-left text-blue-dark text-2xl font-bold">
            Chamado detalhado
          </h1>
        </div>

        {!isDone && (
          <div className="flex gap-2">
            <Button
              color="secondary"
              className="flex items-center gap-2"
              disabled={!isInProgress}
              onClick={() => handleChangeStatus("encerrado")}
            >
              <CircleCheckBig className="h-4 w-4" />
              Encerrar
            </Button>
            <Button
              className="flex items-center gap-2"
              disabled={!isOpen}
              onClick={() => handleChangeStatus("em_atendimento")}
            >
              <Clock2 className="h-4 w-4" />
              Iniciar atendimento
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <div className="rounded-[10px] border border-gray-500 p-4 md:p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {formatTicketCode(ticket.id)}
              </p>
              <Status type={mapTicketStatus(ticket.status)} />
            </div>

            <h2 className="mt-2 text-xl font-bold text-gray-800">
              {ticket.title}
            </h2>

            <div className="mt-6">
              <p className="text-sm text-gray-400">Descrição</p>
              <p className="text-gray-700">{ticket.description}</p>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-400">Categoria</p>
              <p className="text-gray-700">{ticket.service?.title}</p>
            </div>

            <div className="mt-6 flex gap-8">
              <div>
                <p className="text-sm text-gray-400">Criado em</p>
                <p className="text-gray-700">
                  {formatDateTime(ticket.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Atualizado em</p>
                <p className="text-gray-700">
                  {formatDateTime(ticket.updatedAt)}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-400">Cliente</p>
              <div className="mt-2 flex items-center gap-2">
                <AvatarImg
                  name={ticket.client?.name ?? "?"}
                  avatarUrl={getAssetUrl(ticket.client?.img ?? undefined)}
                  size="sm"
                />
                <span className="text-gray-800">{ticket.client?.name}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[10px] border border-gray-500 p-4 md:p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Serviços adicionais</p>
              <Button
                size="sm"
                onClick={() => setAddServiceOpen(true)}
                aria-label="Adicionar serviço"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="mt-4 flex flex-col gap-1">
              {ticketServicesList.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-500 py-3 last:border-0"
                >
                  <span className="font-semibold text-gray-800">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700">
                      R$ {formatCurrency(item.price)}
                    </span>
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={() => handleRemoveService(item.id)}
                      aria-label="Remover serviço"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-feedback-danger" />
                    </Button>
                  </div>
                </div>
              ))}

              {ticketServicesList.length === 0 && (
                <p className="text-sm text-gray-400">
                  Nenhum serviço adicional ainda.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="w-full rounded-[10px] border border-gray-500 p-4 md:w-96 md:p-8">
          <p className="text-sm text-gray-400">Técnico responsável</p>

          {ticket.technician && (
            <div className="mt-3 flex items-center gap-3">
              <AvatarImg
                name={ticket.technician.name}
                avatarUrl={getAssetUrl(ticket.technician.img ?? undefined)}
                size="md"
              />
              <div>
                <p className="font-semibold text-gray-800">
                  {ticket.technician.name}
                </p>
                <p className="text-sm text-gray-400">
                  {ticket.technician.email}
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-gray-500 pt-6">
            <p className="text-sm text-gray-400">Valores</p>
            <div className="mt-2 flex items-center justify-between text-gray-700">
              <span>Preço base</span>
              <span>R$ {formatCurrency(ticket.basePrice)}</span>
            </div>

            {ticketServicesList.length > 0 && (
              <div className="mt-1 flex items-center justify-between text-gray-700">
                <span>Adicionais</span>
                <span>
                  R${" "}
                  {formatCurrency(
                    ticketServicesList
                      .reduce((sum, item) => sum + Number(item.price), 0)
                      .toString(),
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-gray-500 pt-6">
            <span className="font-bold text-gray-800">Total</span>
            <span className="font-bold text-gray-800">
              R$ {formatCurrency(ticket.finalPrice ?? ticket.basePrice)}
            </span>
          </div>
        </div>
      </div>

      {isAddServiceOpen && (
        <ServiceItemModal
          onClose={() => setAddServiceOpen(false)}
          onSubmit={handleAddService}
        />
      )}
    </div>
  );
}

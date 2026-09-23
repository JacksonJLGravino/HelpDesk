import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/Button";
import { Status } from "../../components/Status";
import { AvatarImg } from "../../components/AvatarImg";
import {
  getTicket,
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
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setLoading] = useState(true);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const ticketData = await getTicket(Number(id));
        setTicket(ticketData);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (isLoading) {
    return <p className="p-8 text-center text-gray-400">Carregando...</p>;
  }

  if (!ticket) {
    return (
      <p className="p-8 text-center text-gray-400">Chamado não encontrado.</p>
    );
  }

  const ticketServices = ticket.ticketServices ?? [];

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
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div>
          <div className="flex-1 rounded-[10px] border border-gray-500 p-4 md:p-8">
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
          </div>
        </div>

        <div>
          <div className="w-full rounded-[10px] border border-gray-500 p-4 md:w-96 md:p-8">
            <p className="text-xs font-bold text-gray-400">
              Técnico responsável
            </p>

            {ticket.technician ? (
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
            ) : null}

            <div className="mt-8">
              <p className="text-xs font-bold text-gray-400">Valores</p>
              <div className="mt-2 text-sm flex items-center justify-between text-gray-200">
                <span>Preço base</span>
                <span>R$ {formatCurrency(ticket.basePrice)}</span>
              </div>
            </div>

            {ticketServices.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-bold text-gray-400">Adicionais</p>
                <div className="mt-2 flex flex-col gap-1">
                  {ticketServices.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm text-gray-200"
                    >
                      <span>{item.name}</span>
                      <span>R$ {formatCurrency(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-gray-500 pt-4">
              <span className="font-bold text-sm text-gray-200">Total</span>
              <span className="font-bold text-sm text-gray-200">
                R${" "}
                {ticket.finalPrice
                  ? formatCurrency(ticket.finalPrice)
                  : formatCurrency(ticket.basePrice)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

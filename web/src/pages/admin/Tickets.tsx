import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import {
  Table,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../components/Table";
import { AvatarImg } from "../../components/AvatarImg";
import { Status } from "../../components/Status";
import { Button } from "../../components/Button";
import {
  listTickets,
  mapTicketStatus,
  type Ticket,
} from "../../services/ticketServices";
import { getAssetUrl } from "../../utils/getAssetUrl";
import { formatDateTime } from "../../utils/formatDateTime";

function formatCurrency(price: string | null) {
  return Number(price ?? 0)
    .toFixed(2)
    .replace(".", ",");
}

export function Tickets() {
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

  function handleNavigation(id: number) {
    navigate(`/${id}`);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <div className="flex justify-center flex-col">
      <div className="flex items-center justify-between mb-4 mt-1 md:mb-6 md:mt-8">
        <h1 className="text-left text-blue-dark text-2xl font-bold">
          Chamados
        </h1>
      </div>

      <Table>
        <TableHead>
          <TableHeaderCell>Atualizado em</TableHeaderCell>
          <TableHeaderCell className="hidden md:table-cell">Id</TableHeaderCell>
          <TableHeaderCell>Título e Serviço</TableHeaderCell>
          <TableHeaderCell className="hidden md:table-cell">
            Valor total
          </TableHeaderCell>
          <TableHeaderCell className="hidden md:table-cell">
            Cliente
          </TableHeaderCell>
          <TableHeaderCell className="hidden md:table-cell">
            Técnico
          </TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell> </TableHeaderCell>
        </TableHead>

        <tbody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>{formatDateTime(ticket.updatedAt)}</TableCell>
              <TableCell className="hidden md:table-cell">
                {ticket.id}
              </TableCell>
              <TableCell>
                <p className="font-bold text-sm text-gray-200">
                  {ticket.title}
                </p>
                <p className="text-xs text-gray-200">{ticket.service?.title}</p>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                R$ {formatCurrency(ticket.finalPrice)}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {ticket.client ? (
                  <div className="flex items-center gap-2">
                    <AvatarImg
                      name={ticket.client.name}
                      avatarUrl={getAssetUrl(ticket.client.img ?? undefined)}
                      size="sm"
                    />
                    {ticket.client.name}
                  </div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {ticket.technician ? (
                  <div className="flex items-center gap-2">
                    <AvatarImg
                      name={ticket.technician.name}
                      avatarUrl={getAssetUrl(
                        ticket.technician.img ?? undefined,
                      )}
                      size="sm"
                    />
                    {ticket.technician.name}
                  </div>
                ) : (
                  <span className="text-gray-400">Não atribuído</span>
                )}
              </TableCell>
              <TableCell>
                <Status type={mapTicketStatus(ticket.status)} />
              </TableCell>
              <TableCell align="right">
                <Button
                  color="secondary"
                  size="sm"
                  onClick={() => handleNavigation(ticket.id)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>

      {!isLoading && tickets.length === 0 && (
        <p className="px-6 py-10 text-center text-sm text-gray-400">
          Nenhum chamado encontrado.
        </p>
      )}
    </div>
  );
}

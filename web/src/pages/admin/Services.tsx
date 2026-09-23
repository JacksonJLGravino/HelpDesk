import { useEffect, useState } from "react";
import { Ban, CheckCircle2, PenLine, Plus } from "lucide-react";
import {
  listServices,
  toggleServiceStatus,
  type Service,
} from "../../services/services";
import { StatusBadge } from "../../components/StatusBadge";
import { Button } from "../../components/Button";
import {
  Table,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../components/Table";

import { ServiceModal } from "../../components/ServiceModal";
import { createService, updateService } from "../../services/services";

function formatCurrency(price: string) {
  return Number(price).toFixed(2).replace(".", ",");
}

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(
    undefined,
  );

  async function loadServices() {
    try {
      const data = await listServices();
      setServices(data);
    } catch {
      setServices([]);
    }
  }

  async function handleToggleStatus(service: Service) {
    const newStatus = service.status === "ativo" ? "inativo" : "ativo";

    try {
      await toggleServiceStatus(service.id, newStatus);
      setServices((prev) =>
        prev.map((item) =>
          item.id === service.id ? { ...item, status: newStatus } : item,
        ),
      );
    } catch {
      alert("Não foi possível atualizar o status do serviço.");
    }
  }

  function openCreateModal() {
    setEditingService(undefined);
    setModalOpen(true);
  }

  async function handleSubmitService(data: { title: string; price: number }) {
    if (editingService) {
      await updateService(editingService.id, data);
    } else {
      await createService(data);
    }
    await loadServices();
  }

  function openEditModal(service: Service) {
    setEditingService(service);
    setModalOpen(true);
  }

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <div className="flex justify-center flex-col">
      <div className="flex items-center justify-between mb-4 mt-1 md:mb-6 md:mt-8">
        <h1 className="text-left text-blue-dark text-2xl font-bold ">
          Serviços
        </h1>

        <Button className="flex items-center gap-2" onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Novo
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableHeaderCell>Título</TableHeaderCell>
          <TableHeaderCell>Valor</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell> </TableHeaderCell>
        </TableHead>
        <tbody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell>{service.title}</TableCell>
              <TableCell>R$ {formatCurrency(service.price)}</TableCell>
              <TableCell>
                <StatusBadge status={service.status} />
              </TableCell>
              <TableCell align="right">
                <div className="flex gap-2.5 items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(service)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer"
                  >
                    {service.status === "ativo" ? (
                      <>
                        <Ban className="h-3.5 w-3.5" />
                        <p className="hidden md:block">Desativar</p>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <p className="hidden md:block">Reativar</p>
                      </>
                    )}
                  </button>

                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => openEditModal(service)}
                  >
                    <PenLine className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>

      {isModalOpen && (
        <ServiceModal
          service={editingService}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmitService}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../components/Table";
import { AvatarImg } from "../../components/AvatarImg";
import { Button } from "../../components/Button";
import { ClientModal } from "../../components/ClientModal";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  listClients,
  updateClient,
  deleteClient,
  type Client,
} from "../../services/clientServices";
import { getAssetUrl } from "../../utils/getAssetUrl";

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  async function loadClients() {
    setLoading(true);
    try {
      const data = await listClients();
      setClients(data);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleUpdateClient(data: { name: string; email: string }) {
    if (!editingClient) return;
    await updateClient(editingClient.id, data);
    await loadClients();
  }

  async function handleDeleteClient() {
    if (!deletingClient) return;

    try {
      await deleteClient(deletingClient.id);
      setDeletingClient(null);
      await loadClients();
    } catch {
      alert("Não foi possível excluir o cliente.");
    }
  }

  return (
    <div className="flex justify-center flex-col">
      <div className="flex items-center justify-between mb-4 mt-1 md:mb-6 md:mt-8">
        <h1 className="text-left text-blue-dark text-2xl font-bold">
          Clientes
        </h1>
      </div>

      <Table>
        <TableHead>
          <TableHeaderCell>Nome</TableHeaderCell>
          <TableHeaderCell>E-mail</TableHeaderCell>
          <TableHeaderCell> </TableHeaderCell>
        </TableHead>

        <tbody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <AvatarImg
                    name={client.name}
                    avatarUrl={getAssetUrl(client.img ?? undefined)}
                    size="md"
                  />
                  <span className="font-semibold text-gray-800">
                    {client.name}
                  </span>
                </div>
              </TableCell>

              <TableCell>{client.email}</TableCell>

              <TableCell align="right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => setDeletingClient(client)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-feedback-danger" />
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => setEditingClient(client)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>

      {!isLoading && clients.length === 0 && (
        <p className="px-6 py-10 text-center text-sm text-gray-400">
          Nenhum cliente cadastrado ainda.
        </p>
      )}

      {editingClient && (
        <ClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSubmit={handleUpdateClient}
        />
      )}

      {deletingClient && (
        <ConfirmDialog
          title="Excluir cliente"
          message={`Deseja realmente excluir ${deletingClient.name}? Ao excluir, todos os chamados deste cliente serão removidos e esta ação não poderá ser desfeita.`}
          confirmLabel="Sim, excluir"
          onConfirm={handleDeleteClient}
          onClose={() => setDeletingClient(null)}
        />
      )}
    </div>
  );
}

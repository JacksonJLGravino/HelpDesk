import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PencilLine, Plus } from "lucide-react";
import { Button } from "../../components/Button";
import {
  Table,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../components/Table";
import { AvatarImg } from "../../components/AvatarImg";
import { AvailabilityPreview } from "../../components/AvailabilityPreview";
import { getAssetUrl } from "../../utils/getAssetUrl";
import {
  listTechnicians,
  type Technician,
} from "../../services/technicianServices";

export function Technicians() {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setLoading] = useState(true);

  async function loadTechnicians() {
    setLoading(true);
    try {
      const data = await listTechnicians();
      setTechnicians(data);
    } catch {
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTechnicians();
  }, []);

  return (
    <div className="flex justify-center flex-col">
      <div className="flex items-center justify-between mb-4 mt-1 md:mb-6 md:mt-8">
        <h1 className="text-left text-blue-dark text-2xl font-bold">
          Técnicos
        </h1>

        <Button
          className="flex items-center gap-2"
          onClick={() => navigate("/technicians/new")}
        >
          <Plus className="h-4 w-4" />
          Novo
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableHeaderCell>Nome</TableHeaderCell>
          <TableHeaderCell>E-mail</TableHeaderCell>
          <TableHeaderCell>Disponibilidade</TableHeaderCell>
          <TableHeaderCell> </TableHeaderCell>
        </TableHead>

        <tbody>
          {technicians.map((technician) => (
            <TableRow key={technician.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <AvatarImg
                    name={technician.name}
                    avatarUrl={getAssetUrl(technician.img ?? undefined)}
                    size="md"
                  />
                  <span className="font-semibold text-gray-800">
                    {technician.name}
                  </span>
                </div>
              </TableCell>

              <TableCell>{technician.email}</TableCell>

              <TableCell>
                <AvailabilityPreview
                  times={technician.availability?.workTime ?? []}
                />
              </TableCell>

              <TableCell align="right">
                <Button
                  color="secondary"
                  size="sm"
                  onClick={() => navigate(`/technicians/${technician.id}`)}
                >
                  <PencilLine className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>

      {!isLoading && technicians.length === 0 && (
        <p className="px-6 py-10 text-center text-sm text-gray-400">
          Nenhum técnico cadastrado ainda.
        </p>
      )}
    </div>
  );
}

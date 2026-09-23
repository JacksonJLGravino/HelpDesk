import { useActionState, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { z, ZodError } from "zod";
import { AxiosError } from "axios";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Title } from "../../components/Title";
import { TimeSlotPicker } from "../../components/TimeSlotPicker";
import { AvatarImg } from "../../components/AvatarImg";
import {
  getTechnician,
  updateTechnician,
  type Technician,
} from "../../services/technicianServices";
import { getAssetUrl } from "../../utils/getAssetUrl";

const WORK_PERIODS = [
  {
    label: "Manhã",
    times: ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00"],
  },
  {
    label: "Tarde",
    times: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
  },
  { label: "Noite", times: ["19:00", "20:00", "21:00", "22:00", "23:00"] },
];

const editTechnicianSchema = z.object({
  name: z.string().trim().min(2, { message: "Informe o nome" }),
  email: z.email({ message: "E-mail inválido" }),
  workTime: z
    .array(z.string())
    .min(1, { message: "Selecione ao menos um horário" }),
});

type EditTechnicianState = {
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "workTime", string[]>>;
} | null;

export function EditTechnician() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [technician, setTechnician] = useState<Technician | null>(null);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTechnician() {
      if (!id) return;

      try {
        const data = await getTechnician(id);
        setTechnician(data);
        setSelectedTimes(data.availability?.workTime ?? []);
      } finally {
        setLoading(false);
      }
    }

    loadTechnician();
  }, [id]);

  const [state, formAction, isSaving] = useActionState<
    EditTechnicianState,
    FormData
  >(handleSaveAction, null);

  function toggleTime(time: string) {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time],
    );
  }

  async function handleSaveAction(
    _: EditTechnicianState,
    formData: FormData,
  ): Promise<EditTechnicianState> {
    if (!id) return { message: "Técnico não encontrado" };

    try {
      const data = editTechnicianSchema.parse({
        name: formData.get("name"),
        email: formData.get("email"),
        workTime: selectedTimes,
      });

      await updateTechnician(id, data);

      navigate("/technicians");
      return null;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = z.flattenError(error).fieldErrors;
        return { message: error.issues[0].message, fieldErrors };
      }
      if (error instanceof AxiosError) {
        return {
          message:
            error.response?.data?.message ??
            "Não foi possível salvar o técnico",
        };
      }
      return { message: "Não foi possível salvar o técnico" };
    }
  }

  if (isLoading) {
    return <p className="p-8 text-center text-gray-400">Carregando...</p>;
  }

  if (!technician) {
    return (
      <p className="p-8 text-center text-gray-400">Técnico não encontrado.</p>
    );
  }

  return (
    <div className="flex justify-center">
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
              Perfil de técnico
            </h1>
          </div>

          <div className="flex gap-2">
            <Button color="secondary" onClick={() => navigate(-1)}>
              Cancelar
            </Button>

            <Button
              type="submit"
              form="edit-technician-form"
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {state?.message && (
          <p className="mb-4 text-sm text-feedback-danger">{state.message}</p>
        )}

        <div className="flex flex-col gap-4 md:flex-row">
          <form
            id="edit-technician-form"
            action={formAction}
            className="flex flex-col border gap-5 border-gray-500 rounded-[10px] p-4 md:p-8 md:gap-6"
          >
            <Title
              title="Dados pessoais"
              subtitle="Defina as informações do perfil de técnico"
            />

            <AvatarImg
              name={technician.name}
              avatarUrl={getAssetUrl(technician.img ?? undefined)}
              size="lg"
            />

            <Input
              name="name"
              label="Nome"
              type="text"
              defaultValue={technician.name}
              placeholder="Nome completo"
              error={state?.fieldErrors?.name}
            />

            <Input
              name="email"
              label="e-mail"
              type="email"
              defaultValue={technician.email}
              placeholder="exemplo@mail.com"
              error={state?.fieldErrors?.email}
            />
          </form>

          <div>
            <div className="flex flex-col gap-5 border border-gray-500 rounded-[10px] p-4 md:p-8 md:gap-6">
              <Title
                title="Horários de atendimento"
                subtitle="Selecione os horários de disponibilidade do técnico para atendimento"
              />

              <div className="flex flex-col gap-5">
                {WORK_PERIODS.map((period) => (
                  <div key={period.label}>
                    <h6 className="mb-3 text-xs font-bold uppercase text-gray-400">
                      {period.label}
                    </h6>
                    <TimeSlotPicker
                      times={period.times}
                      selected={selectedTimes}
                      onToggle={toggleTime}
                    />
                  </div>
                ))}
              </div>

              {state?.fieldErrors?.workTime?.[0] && (
                <p className="text-xs text-feedback-danger">
                  {state.fieldErrors.workTime[0]}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

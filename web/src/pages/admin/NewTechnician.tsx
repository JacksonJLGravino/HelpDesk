import { useActionState, useState } from "react";
import { useNavigate } from "react-router";
import { z, ZodError } from "zod";
import { AxiosError } from "axios";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Title } from "../../components/Title";
import { TimeSlotPicker } from "../../components/TimeSlotPicker";
import { createTechnician } from "../../services/technicianServices";

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

const newTechnicianSchema = z.object({
  name: z.string().trim().min(2, { message: "Informe o nome" }),
  email: z.email({ message: "E-mail inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 dígitos" }),
  workTime: z
    .array(z.string())
    .min(1, { message: "Selecione ao menos um horário" }),
});

type NewTechnicianState = {
  message?: string;
  fieldErrors?: Partial<
    Record<"name" | "email" | "password" | "workTime", string[]>
  >;
} | null;

export function NewTechnician() {
  const navigate = useNavigate();
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  const [state, formAction, isLoading] = useActionState<
    NewTechnicianState,
    FormData
  >(createTechnicianAction, null);

  function toggleTime(time: string) {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time],
    );
  }

  async function createTechnicianAction(
    _: NewTechnicianState,
    formData: FormData,
  ): Promise<NewTechnicianState> {
    try {
      const data = newTechnicianSchema.parse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        workTime: selectedTimes,
      });

      await createTechnician(data);

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
            error.response?.data?.message ?? "Não foi possível criar o técnico",
        };
      }
      return { message: "Não foi possível criar o técnico" };
    }
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
            <h1 className="text-left text-blue-dark text-2xl font-bold ">
              Perfil de técnico
            </h1>
          </div>

          <div className="flex gap-2">
            <Button color="secondary" onClick={() => navigate(-1)}>
              Cancelar
            </Button>

            <Button
              type="submit"
              form="new-technician-form"
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div>
            <form
              id="new-technician-form"
              action={formAction}
              className="flex flex-col border gap-5 border-gray-500 rounded-[10px] p-4 md:p-5 md:gap-6"
            >
              <Title
                title="Dados pessoais"
                subtitle="Defina as informações do perfil de técnico"
              />

              <Input
                name="name"
                required
                label="Nome"
                type="text"
                placeholder="Nome completo"
                error={state?.fieldErrors?.name}
              />

              <Input
                name="email"
                required
                label="e-mail"
                type="email"
                placeholder="exemplo@mail.com"
                error={state?.fieldErrors?.email}
              />

              <Input
                name="password"
                required
                label="senha"
                type="password"
                placeholder="Defina a senha de acesso"
                helper="Mínimo de 6 dígitos"
                error={state?.fieldErrors?.password}
              />
            </form>
          </div>
          <div className="flex flex-col gap-5 border border-gray-500 rounded-[10px] p-4 md:p-5 md:gap-6">
            <Title
              title="Horários de atendimento"
              subtitle="Selecione os horários de disponibilidade do técnico para atendimento"
            />

            <div className="flex flex-col flex-wrap gap-4 md:gap-5">
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

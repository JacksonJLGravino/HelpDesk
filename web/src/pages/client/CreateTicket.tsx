import { useActionState, useEffect, useState } from "react";
import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { TextArea } from "../../components/TextArea";
import { Title } from "../../components/Title";
import { api } from "../../services/api";
import { z, ZodError } from "zod";
import { Button } from "../../components/Button";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";

type Service = {
  id: number;
  title: string;
  price: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
};

const newTicketSchema = z.object({
  title: z.string().trim().min(3, { message: "Informe um título" }),
  description: z.string().trim().optional(),
  serviceId: z.coerce
    .number()
    .int()
    .positive({ message: "Selecione a categoria de serviço" }),
});

type NewTicketState = {
  message?: string;
  fieldErrors?: Partial<
    Record<"title" | "description" | "serviceId", string[]>
  >;
} | null;

export function CreateTicket() {
  const [services, setServices] = useState<Service[]>([]);
  const [category, setCategory] = useState<Service | undefined>(undefined);
  const [state, formAction, isLoading] = useActionState<
    NewTicketState,
    FormData
  >(createTicket, null);

  const navigate = useNavigate();

  async function createTicket(
    _: NewTicketState,
    formData: FormData,
  ): Promise<NewTicketState> {
    try {
      const data = newTicketSchema.parse({
        title: formData.get("title"),
        description: formData.get("description"),
        serviceId: formData.get("serviceId"),
      });

      await api.post("/tickets", data);

      navigate("/");
      return null;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = z.flattenError(error).fieldErrors;
        return { message: error.issues[0].message, fieldErrors };
      }
      if (error instanceof AxiosError) {
        return {
          message:
            error.response?.data?.message ?? "Não foi possível criar o chamado",
        };
      }
      return { message: "Não foi possível criar o chamado" };
    }
  }

  async function getServiceOnAPI() {
    try {
      const response = await api.get("/services/available");
      setServices(response.data);
    } catch {
      setServices([]);
    }
  }

  function handleSelectService(serviceId: number) {
    const service = services.find((item) => item.id === serviceId);
    setCategory(service);
  }

  useEffect(() => {
    getServiceOnAPI();
  }, []);

  return (
    <div className="flex justify-center">
      <div>
        <div>
          <h1 className="text-left text-blue-dark text-2xl font-bold mb-4 mt-1 md:mb-6 md:mt-8">
            Novo chamado
          </h1>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <form
            id="new-ticket-form"
            action={formAction}
            className="flex flex-col border gap-5 border-gray-500 rounded-[10px] p-4 md:p-8 md:gap-6"
          >
            <Title
              title="Informações"
              subtitle="Configure os dias e horários em que você está disponível para atender chamados"
            />

            <Input
              name="title"
              required
              label="Título"
              placeholder="Digite um título para o chamado"
              error={state?.fieldErrors?.title}
            />

            <TextArea
              name="description"
              label="Descrição"
              rows={6}
              placeholder="Descreva o que está acontecendo"
            />

            <Select
              name="serviceId"
              required
              label="Categoria de serviço"
              placeholder="Selecione a categoria de atendimento"
              error={state?.fieldErrors?.serviceId?.[0]}
              options={services.map((service) => ({
                label: service.title,
                id: service.id,
              }))}
              onChange={(value) => handleSelectService(Number(value))}
            />
          </form>

          <div>
            <div className="flex flex-col gap-5 border border-gray-500 rounded-[10px] p-4 md:p-8 md:gap-6 md:max-w-74">
              <Title title="Resumo" subtitle="Valores e detalhes" />

              <div>
                <p className="text-xs font-bold text-gray-400">
                  Categoria de serviço
                </p>
                <p className="text-sm text-gray-200">
                  {category ? category.title : "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400">Custo inicial</p>
                <p className="text-2xl font-bold text-gray-200">
                  <span className="mr-1 align-baseline text-xs font-bold">
                    R$
                  </span>
                  {category
                    ? `${Number(category.price).toFixed(2).replace(".", ",")}`
                    : "0,00"}
                </p>
              </div>

              <p className="text-xs text-gray-300">
                O chamado será automaticamente atribuído a um técnico disponível
              </p>

              <Button type="submit" form="new-ticket-form" disabled={isLoading}>
                {isLoading ? "Criando chamado..." : "Criar chamado"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

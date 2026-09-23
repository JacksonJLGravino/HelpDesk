import { useActionState } from "react";
import { z, ZodError } from "zod";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Button } from "./Button";

const ticketServiceSchema = z.object({
  name: z.string().trim().min(2, { message: "Informe a descrição" }),
  price: z.coerce.number().positive({ message: "Informe um valor válido" }),
});

type TicketServiceState = {
  message?: string;
  fieldErrors?: Partial<Record<"name" | "price", string[]>>;
} | null;

type Props = {
  onClose: () => void;
  onSubmit: (data: { name: string; price: number }) => Promise<void>;
};

export function ServiceItemModal({ onClose, onSubmit }: Props) {
  const [state, formAction, isSubmitting] = useActionState<
    TicketServiceState,
    FormData
  >(handleAction, null);

  async function handleAction(
    _: TicketServiceState,
    formData: FormData,
  ): Promise<TicketServiceState> {
    try {
      const data = ticketServiceSchema.parse({
        name: formData.get("name"),
        price: formData.get("price"),
      });

      await onSubmit(data);
      onClose();
      return null;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = z.flattenError(error).fieldErrors;
        return { message: error.issues[0].message, fieldErrors };
      }
      return { message: "Não foi possível salvar o serviço adicional." };
    }
  }

  return (
    <Modal
      title="Serviço adicional"
      onClose={onClose}
      footer={
        <Button
          type="submit"
          form="ticket-service-form"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      }
    >
      <form
        id="ticket-service-form"
        action={formAction}
        className="flex flex-col gap-6"
      >
        {state?.message && (
          <p className="text-sm text-feedback-danger">{state.message}</p>
        )}

        <Input
          name="name"
          label="Descrição"
          placeholder="Nome do serviço adicional"
          error={state?.fieldErrors?.name}
        />

        <div className="group">
          <label className="block text-xs font-bold uppercase text-gray-300">
            Valor
          </label>
          <div className="mt-2 flex items-center gap-2 border-b border-gray-500 pb-1 transition-colors group-has-focus:border-blue-base">
            <span className="text-sm text-gray-200">R$</span>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              className="w-full bg-transparent text-sm text-gray-200 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          {state?.fieldErrors?.price?.[0] && (
            <p className="mt-1 text-xs text-feedback-danger">
              {state.fieldErrors.price[0]}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}

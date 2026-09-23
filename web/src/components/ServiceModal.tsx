import { useActionState } from "react";
import { z, ZodError } from "zod";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Button } from "./Button";
import type { Service } from "../services/services";

const serviceSchema = z.object({
  title: z.string().trim().min(2, { message: "Informe um título" }),
  price: z.coerce.number().positive({ message: "Informe um valor válido" }),
});

type ServiceFormState = {
  message?: string;
  fieldErrors?: Partial<Record<"title" | "price", string[]>>;
} | null;

type Props = {
  service?: Service;
  onClose: () => void;
  onSubmit: (data: { title: string; price: number }) => Promise<void>;
};

export function ServiceModal({ service, onClose, onSubmit }: Props) {
  const [state, formAction, isSubmitting] = useActionState<
    ServiceFormState,
    FormData
  >(handleAction, null);

  async function handleAction(
    _: ServiceFormState,
    formData: FormData,
  ): Promise<ServiceFormState> {
    try {
      const data = serviceSchema.parse({
        title: formData.get("title"),
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
      return {
        message: "Não foi possível salvar o serviço. Tente novamente.",
      };
    }
  }

  return (
    <Modal
      title={service ? "Editar serviço" : "Cadastro de serviço"}
      onClose={onClose}
      footer={
        <Button
          type="submit"
          form="service-form"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      }
    >
      <form
        id="service-form"
        action={formAction}
        className="flex flex-col gap-6"
      >
        <Input
          name="title"
          label="Título"
          defaultValue={service?.title}
          placeholder="Nome do serviço"
          error={state?.fieldErrors?.title}
        />

        <div className="group">
          <label
            className={`block text-xs font-bold uppercase transition-colors ${
              state?.fieldErrors?.price
                ? "text-feedback-danger"
                : "text-gray-300"
            }`}
          >
            Valor
          </label>
          <div className="mt-2 flex items-center gap-2 border-b border-gray-500 pb-1 transition-colors group-has-focus:border-blue-base">
            <span className="text-sm text-gray-200">R$</span>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={service?.price}
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

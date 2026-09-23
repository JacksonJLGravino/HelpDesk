import { useActionState } from "react";
import { z, ZodError } from "zod";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Button } from "./Button";
import { AvatarImg } from "./AvatarImg";
import { getAssetUrl } from "../utils/getAssetUrl";
import type { Client } from "../services/clientServices";

const clientSchema = z.object({
  name: z.string().trim().min(2, { message: "Informe o nome" }),
  email: z.email({ message: "E-mail inválido" }),
});

type ClientFormState = {
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email", string[]>>;
} | null;

type Props = {
  client: Client;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string }) => Promise<void>;
};

export function ClientModal({ client, onClose, onSubmit }: Props) {
  const [state, formAction, isSubmitting] = useActionState<
    ClientFormState,
    FormData
  >(handleAction, null);

  async function handleAction(
    _: ClientFormState,
    formData: FormData,
  ): Promise<ClientFormState> {
    try {
      const data = clientSchema.parse({
        name: formData.get("name"),
        email: formData.get("email"),
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
        message: "Não foi possível salvar o cliente. Tente novamente.",
      };
    }
  }

  return (
    <Modal
      title="Cliente"
      onClose={onClose}
      footer={
        <Button
          type="submit"
          form="client-form"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <AvatarImg
          name={client.name}
          avatarUrl={getAssetUrl(client.img ?? undefined)}
          size="lg"
        />

        <form
          id="client-form"
          action={formAction}
          className="flex flex-col gap-6"
        >
          {state?.message && (
            <p className="text-sm text-feedback-danger">{state.message}</p>
          )}

          <Input
            name="name"
            label="Nome"
            defaultValue={client.name}
            error={state?.fieldErrors?.name}
          />
          <Input
            name="email"
            label="E-mail"
            type="email"
            defaultValue={client.email}
            error={state?.fieldErrors?.email}
          />
        </form>
      </div>
    </Modal>
  );
}

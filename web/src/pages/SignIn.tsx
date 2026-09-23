import { useActionState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Title } from "../components/Title";
import { LinkBtn } from "../components/LinkBtn";
import { z, ZodError } from "zod";
import { api } from "../services/api";
import { AxiosError } from "axios";
import { useAuth } from "../hooks/useAuth";

const signInSchema = z.object({
  email: z.email({ message: "E-mail inválido" }),
  password: z.string().min(1, { message: "Informe a senha" }),
});

type SignInState = {
  message?: string | undefined;
  fieldErrors?: Partial<Record<"email" | "password", string[]>> | undefined;
} | null;

export function SignIn() {
  const [state, formAction, isLoading] = useActionState<SignInState, FormData>(
    signIn,
    null,
  );

  const auth = useAuth();

  async function signIn(
    _: SignInState,
    formData: FormData,
  ): Promise<SignInState> {
    try {
      const data = signInSchema.parse({
        email: formData.get("email"),
        password: formData.get("password"),
      });

      const response = await api.post("/sessions", data);
      auth.save(response.data);

      return null;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = z.flattenError(error).fieldErrors;
        return { message: error.issues[0].message, fieldErrors };
      }
      if (error instanceof AxiosError) {
        return {
          message: error.response?.data?.message ?? "E-mail ou senha inválidos",
        };
      }
      return { message: "Não foi possível entrar" };
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-8 p-6 border mb-3 mx-6 w-85.5 border-gray-500 rounded-[10px] md:w-100">
        <Title
          title="Acesse o portal"
          subtitle="Entre usando seu e-mail e senha cadastrados"
        />

        <form
          id="sign-in-form"
          action={formAction}
          className="flex flex-col gap-4"
        >
          {state?.message && (
            <p className="text-sm text-feedback-danger">{state.message}</p>
          )}
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
            placeholder="Digite sua senha"
            error={state?.fieldErrors?.password}
          />
        </form>
        <Button type="submit" form="sign-in-form" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </div>

      <div className="flex flex-col gap-6 p-6 border mb-3 mx-6 w-85.5 border-gray-500 rounded-[10px] md:w-100">
        <Title
          title="Ainda não tem uma conta?"
          subtitle="Cadastre agora mesmo"
        />
        <LinkBtn href="/signup">Criar conta</LinkBtn>
      </div>
    </div>
  );
}

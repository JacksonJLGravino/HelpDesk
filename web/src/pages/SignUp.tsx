import { useActionState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Title } from "../components/Title";
import { LinkBtn } from "../components/LinkBtn";
import { z, ZodError } from "zod";
import { AxiosError } from "axios";
import { api } from "../services/api";
import { useNavigate } from "react-router";

const signUpSchema = z.object({
  name: z.string().trim().min(2, { message: "Informe o nome" }),
  email: z.email({ message: "E-mail inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 dígitos" }),
});

type SignUpState = {
  message?: string | undefined;
  fieldErrors?:
    | Partial<Record<"name" | "email" | "password", string[]>>
    | undefined;
} | null;

export function SignUp() {
  const [state, formAction, isLoading] = useActionState<SignUpState, FormData>(
    signUp,
    null,
  );

  const navigate = useNavigate();

  async function signUp(
    _: SignUpState,
    formData: FormData,
  ): Promise<SignUpState> {
    try {
      const data = signUpSchema.parse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      });
      await api.post("/users", data);

      if (confirm("Cadastrado com sucesso. Ir para a tela de entrar?")) {
        navigate("/");
      }

      return null;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = z.flattenError(error).fieldErrors;
        return { message: error.issues[0].message, fieldErrors };
      }
      if (error instanceof AxiosError) {
        return {
          message: error.response?.data?.message ?? "Erro ao criar conta",
        };
      }

      return { message: "Não foi criar conta" };
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-8 p-6 border mb-3 mx-6 w-85.5 border-gray-500 rounded-[10px] md:w-100">
        <Title
          title="Crie sua conta"
          subtitle="Informe seu nome, e-mail e senha"
        />

        <form
          id="sign-up-form"
          action={formAction}
          className="flex flex-col gap-4"
        >
          <Input
            name="name"
            required
            label="Nome"
            type="text"
            placeholder="Digite o nome completo"
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
            placeholder="Digite sua senha"
            helper="Mínimo de 6 dígitos"
            error={state?.fieldErrors?.password}
          />
        </form>
        <Button type="submit" form="sign-up-form" disabled={isLoading}>
          {isLoading ? "Criando conta..." : "Criar conta"}
        </Button>
      </div>

      <div className="flex flex-col gap-6 p-6 border mb-3 mx-6 w-85.5 border-gray-500 rounded-[10px] md:w-100">
        <Title title="Já uma conta?" subtitle="Entre agora mesmo" />
        <LinkBtn href="/">Acessar conta</LinkBtn>
      </div>
    </div>
  );
}

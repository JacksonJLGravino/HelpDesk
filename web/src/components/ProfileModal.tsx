import { useActionState, useState } from "react";
import { z, ZodError } from "zod";
import { AxiosError } from "axios";
import { Modal } from "./Modal";
import { AvatarUpload } from "./AvatarUpload";
import { Button } from "./Button";
import { Input } from "./Input";
import { useAuth } from "../hooks/useAuth";
import { uploadAvatar, deleteAvatar } from "../services/avatarServices";
import { updateProfile, updatePassword } from "../services/profileServices";
import { getAssetUrl } from "../utils/getAssetUrl";

export type ProfileRole = "admin" | "client" | "tecnico";

export type ProfileUser = {
  name: string;
  email: string;
  avatarUrl?: string;
  availability?: string[];
};

type Props = {
  role: ProfileRole;
  user: ProfileUser;
  onClose: () => void;
};

type View = "profile" | "password";

const profileSchema = z.object({
  name: z.string().trim().min(2, { message: "Informe o nome" }),
  email: z.email({ message: "E-mail inválido" }),
});

type ProfileState = {
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email", string[]>>;
} | null;

const passwordSchema = z.object({
  oldPassword: z.string().min(1, { message: "Informe sua senha atual" }),
  password: z
    .string()
    .min(6, { message: "A nova senha deve ter pelo menos 6 dígitos" }),
});

type PasswordState = {
  message?: string;
  fieldErrors?: Partial<Record<"oldPassword" | "password", string[]>>;
} | null;

export function ProfileModal({ role, user, onClose }: Props) {
  const { session, save } = useAuth();

  const [view, setView] = useState<View>("profile");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

  const [profileState, profileFormAction, isSavingProfile] = useActionState<
    ProfileState,
    FormData
  >(handleSaveProfile, null);

  const [passwordState, passwordFormAction, isSavingPassword] = useActionState<
    PasswordState,
    FormData
  >(handleSavePassword, null);

  async function handleSaveProfile(
    _: ProfileState,
    formData: FormData,
  ): Promise<ProfileState> {
    try {
      const data = profileSchema.parse({
        name: formData.get("name"),
        email: formData.get("email"),
      });

      await updateProfile(data);

      save({
        ...session!,
        user: { ...session!.user, name: data.name, email: data.email },
      });

      onClose();
      return null;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = z.flattenError(error).fieldErrors;
        return { message: error.issues[0].message, fieldErrors };
      }
      if (error instanceof AxiosError) {
        return {
          message:
            error.response?.data?.message ?? "Não foi possível salvar o perfil",
        };
      }
      return { message: "Não foi possível salvar o perfil" };
    }
  }

  async function handleSavePassword(
    _: PasswordState,
    formData: FormData,
  ): Promise<PasswordState> {
    try {
      const data = passwordSchema.parse({
        oldPassword: formData.get("oldPassword"),
        password: formData.get("password"),
      });

      await updatePassword(data);

      setView("profile");
      return null;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = z.flattenError(error).fieldErrors;
        return { message: error.issues[0].message, fieldErrors };
      }
      if (error instanceof AxiosError) {
        return {
          message:
            error.response?.data?.message ?? "Não foi possível alterar a senha",
        };
      }
      return { message: "Não foi possível alterar a senha" };
    }
  }

  async function handleUploadAvatar(file: File) {
    try {
      const newFileName = await uploadAvatar(file);

      setAvatarUrl(getAssetUrl(newFileName));

      save({
        ...session!,
        user: { ...session!.user, img: newFileName },
      });

      alert("Foto atualizada com sucesso!");
    } catch {
      alert("Não foi possível atualizar a foto. Tente novamente.");
    }
  }

  async function handleDeleteAvatar() {
    if (!confirm("Remover sua foto de perfil?")) return;

    try {
      await deleteAvatar();

      setAvatarUrl(undefined);
      save({
        ...session!,
        user: { ...session!.user, img: undefined },
      });
    } catch {
      alert("Não foi possível remover a foto. Tente novamente.");
    }
  }

  if (view === "password") {
    return (
      <Modal
        title="Alterar senha"
        onClose={onClose}
        onBack={() => setView("profile")}
        footer={
          <Button
            type="submit"
            form="password-form"
            className="w-full"
            disabled={isSavingPassword}
          >
            {isSavingPassword ? "Salvando..." : "Salvar"}
          </Button>
        }
      >
        <form
          id="password-form"
          action={passwordFormAction}
          className="flex flex-col gap-6"
        >
          {passwordState?.message && (
            <p className="text-sm text-feedback-danger">
              {passwordState.message}
            </p>
          )}

          <Input
            name="oldPassword"
            label="Senha atual"
            type="password"
            placeholder="Digite sua senha atual"
            error={passwordState?.fieldErrors?.oldPassword}
          />
          <Input
            name="password"
            label="Nova senha"
            type="password"
            placeholder="Digite sua nova senha"
            helper="Mínimo de 6 dígitos"
            error={passwordState?.fieldErrors?.password}
          />
        </form>
      </Modal>
    );
  }

  return (
    <Modal
      title="Perfil"
      onClose={onClose}
      footer={
        <Button
          type="submit"
          form="profile-form"
          className="w-full"
          disabled={isSavingProfile}
        >
          {isSavingProfile ? "Salvando..." : "Salvar"}
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <AvatarUpload
          name={user.name}
          avatarUrl={avatarUrl}
          onUpload={handleUploadAvatar}
          onDelete={handleDeleteAvatar}
        />

        <form
          id="profile-form"
          action={profileFormAction}
          className="flex flex-col gap-6"
        >
          {profileState?.message && (
            <p className="text-sm text-feedback-danger">
              {profileState.message}
            </p>
          )}

          <Input
            name="name"
            label="Nome"
            defaultValue={user.name}
            error={profileState?.fieldErrors?.name}
          />
          <Input
            name="email"
            label="E-mail"
            type="email"
            defaultValue={user.email}
            error={profileState?.fieldErrors?.email}
          />
        </form>

        <Input
          label="Senha"
          type="password"
          value="********"
          readOnly
          trailing={
            <Button
              type="button"
              onClick={() => setView("password")}
              color="secondary"
              size="sm"
              className="mb-2"
            >
              Alterar
            </Button>
          }
        />

        {role === "tecnico" && user.availability && (
          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-sm font-bold text-gray-800">Disponibilidade</h3>
            <p className="text-xs text-gray-400">
              Horários de atendimento definidos pelo admin
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {user.availability.map((time) => (
                <span
                  key={time}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600"
                >
                  {time}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

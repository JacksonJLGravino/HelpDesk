import { Trash, Upload } from "lucide-react";
import { Button } from "./Button";
import { AvatarImg } from "./AvatarImg";
import { useRef } from "react";

type Props = {
  name: string;
  avatarUrl?: string;
  onUpload: (file: File) => void;
  onDelete: () => void;
};
export function AvatarUpload({ avatarUrl, name, onUpload, onDelete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    event.target.value = "";
  }
  return (
    <div className="flex items-center gap-3">
      <AvatarImg name={name} avatarUrl={avatarUrl} size="lg" />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        size="sm"
        color="secondary"
        className="flex font-bold items-center gap-2"
      >
        <Upload className="h-3.5 w-3.5" />
        Nova imagem
      </Button>

      <Button color="secondary" size="sm" onClick={onDelete}>
        <Trash className="h-3.5 w-3.5 text-feedback-danger" />
      </Button>
    </div>
  );
}

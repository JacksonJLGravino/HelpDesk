import { CircleCheckBig, Clock2, PencilLine } from "lucide-react";
import { Button } from "./Button";
import { Status, type StatusType } from "./Status";
import { AvatarImg } from "./AvatarImg";

type Props = {
  code: string;
  title: string;
  serviceName: string;
  date: string;
  price: string;
  clientName: string;
  clientAvatarUrl?: string;
  status: StatusType;
  onEdit: () => void;
  onStart?: () => void;
  onFinish?: () => void;
};

export function TicketCard({
  code,
  title,
  serviceName,
  date,
  price,
  clientName,
  clientAvatarUrl,
  status,
  onEdit,
  onStart,
  onFinish,
}: Props) {
  return (
    <div className="flex flex-col rounded-[10px] border  min-w-84 border-gray-500 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-400">{code}</p>

        <div className="flex items-center gap-2">
          <Button
            color="secondary"
            size="sm"
            onClick={onEdit}
            aria-label="Editar chamado"
          >
            <PencilLine className="h-3.5 w-3.5" />
          </Button>

          {onStart && (
            <Button
              size="sm"
              className="flex items-center gap-1.5"
              onClick={onStart}
            >
              <Clock2 className="h-3.5 w-3.5" />
              Iniciar
            </Button>
          )}

          {onFinish && (
            <Button
              size="sm"
              className="flex items-center gap-1.5"
              onClick={onFinish}
            >
              <CircleCheckBig className="h-3.5 w-3.5" />
              Encerrar
            </Button>
          )}
        </div>
      </div>

      <h3 className="font-bold text-gray-100">{title}</h3>
      <p className="text-xs text-gray-200">{serviceName}</p>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-200">
        <span>{date}</span>
        <span className="font-semibold">R$ {price}</span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-500 pt-4">
        <div className="flex items-center gap-2">
          <AvatarImg name={clientName} avatarUrl={clientAvatarUrl} size="sm" />
          <span className="text-sm font-semibold text-gray-800">
            {clientName}
          </span>
        </div>

        <Status type={status} />
      </div>
    </div>
  );
}

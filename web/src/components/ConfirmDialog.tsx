import { Modal } from "./Modal";
import { Button } from "./Button";

type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <Button
            type="button"
            color="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button type="button" className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-gray-200">{message}</p>
    </Modal>
  );
}

import type { ReactNode } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "./Button";

type Props = {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ title, onClose, onBack, children, footer }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-2xl bg-gray-600">
        <div className="flex items-center gap-3 border-b border-gray-500 px-6 py-5">
          {onBack && (
            <Button type="button" onClick={onBack} color="link" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <h2 className="flex-1 text-lg font-bold text-gray-200">{title}</h2>

          <Button type="button" onClick={onClose} color="link" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>

        {footer && (
          <div className="border-t border-gray-500 px-6 py-5">{footer}</div>
        )}
      </div>
    </div>
  );
}

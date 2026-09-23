import type { LucideIcon } from "lucide-react";

export type DropdownCardItem = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "danger";
};

type Props = {
  title: string;
  items: DropdownCardItem[];
};

export function DropdownCard({ title, items }: Props) {
  return (
    <div className="w-52 rounded-[10px] bg-gray-100 p-4 border border-gray-400">
      <p className="mb-4 text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {title}
      </p>

      <ul className="flex flex-col gap-4">
        {items.map(({ label, icon: Icon, onClick, variant = "default" }) => (
          <li key={label}>
            <button
              type="button"
              onClick={onClick}
              className={`flex w-full items-center gap-2 text-[16px] font-medium transition-colors cursor-pointer ${
                variant === "danger"
                  ? "text-feedback-danger hover:text-red-500"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

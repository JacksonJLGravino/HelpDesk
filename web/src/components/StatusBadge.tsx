import { Ban, CircleCheckBig } from "lucide-react";

type Props = {
  status: "ativo" | "inativo";
};

export function StatusBadge({ status }: Props) {
  const isActive = status === "ativo";

  return (
    <div>
      <span
        className={` rounded-full px-3 py-1 text-xs font-semibold hidden md:inline ${
          isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
        }`}
      >
        {isActive ? "Ativo" : "Inativo"}
      </span>

      <div
        className={`rounded-full h-7 w-7 flex md:hidden ${
          isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
        }`}
      >
        {isActive ? (
          <CircleCheckBig className="h-4 w-4 m-1.5" />
        ) : (
          <Ban className="h-4 w-4 m-1.5" />
        )}
      </div>
    </div>
  );
}

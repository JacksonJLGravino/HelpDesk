import {
  CircleCheckBig,
  CircleHelp,
  Clock2,
  type LucideIcon,
} from "lucide-react";
import { classMerge } from "../utils/classMerge";

export type StatusType = "open" | "progress" | "done";

type Props = {
  type: StatusType;
};

type StatusConfig = {
  icon: LucideIcon;
  color: string;
  bg: string;
  label: string;
  size: string;
};

const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  open: {
    icon: CircleHelp,
    color: "text-feedback-open",
    bg: "bg-[rgba(204,61,106,0.2)]",
    label: "Aberto",
    size: "md:w-[77px]",
  },
  progress: {
    icon: Clock2,
    color: "text-feedback-progress",
    bg: "bg-[rgba(53,94,197,0.2)]",
    label: "Em Atendimento",
    size: "md:w-[128px]",
  },
  done: {
    icon: CircleCheckBig,
    color: "text-feedback-done",
    bg: "bg-[rgba(80,139,38,0.2)]",
    label: "Encerrado",
    size: "md:w-[95px]",
  },
};

export function Status({ type }: Props) {
  const { icon: Icon, color, bg, label, size } = STATUS_CONFIG[type];

  return (
    <div
      className={classMerge([
        "flex gap-1.5 p-1.5 h-7 w-7 rounded-4xl",
        bg,
        size,
      ])}
    >
      <Icon className={classMerge(["h-4 w-4 shrink-0", color])} />
      <p
        className={classMerge([
          "hidden whitespace-nowrap text-xs font-bold md:block",
          color,
        ])}
      >
        {label}
      </p>
    </div>
  );
}

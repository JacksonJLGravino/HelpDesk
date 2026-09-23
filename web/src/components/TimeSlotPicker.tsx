import { X } from "lucide-react";
import { classMerge } from "../utils/classMerge";

type Props = {
  times: string[];
  selected: string[];
  onToggle?: (time: string) => void;
  readOnly?: boolean;
};

const variants = {
  default: "border border-gray-400 text-gray-200 hover:bg-gray-400",
  selected: "border border-blue-base bg-blue-base text-gray-600",
  readOnly: "border border-gray-500 text-gray-400 cursor-default",
};

export function TimeSlotPicker({
  times,
  selected,
  onToggle,
  readOnly = false,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {times.map((time) => {
        const isSelected = selected.includes(time);

        if (readOnly) {
          return (
            <span
              key={time}
              className={classMerge([
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                variants.readOnly,
              ])}
            >
              {time}
            </span>
          );
        }

        return (
          <button
            key={time}
            type="button"
            onClick={() => onToggle?.(time)}
            className={classMerge([
              "flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              isSelected ? variants.selected : variants.default,
            ])}
          >
            {time}
            {isSelected && <X className="h-3.5 w-3.5" />}
          </button>
        );
      })}
    </div>
  );
}

import { ChevronDown } from "lucide-react";

type Option = {
  label: string;
  id: number | string;
};

type Props = Omit<React.ComponentProps<"select">, "onChange"> & {
  label?: string;
  error?: string;
  helper?: string;
  placeholder?: string;
  options?: Option[];
  onChange?: (value: string) => void;
};

export function Select({
  label,
  error,
  helper,
  placeholder,
  options,
  onChange,
  ...rest
}: Props) {
  return (
    <div className="group">
      <label
        className={`block text-xs uppercase font-bold  group-has-focus:text-blue-base transition-colors ${
          error ? "text-feedback-danger" : "text-gray-300"
        }`}
      >
        {label}
      </label>

      <div className="relative">
        <select
          onChange={(event) => onChange?.(event.target.value)}
          className={`mt-2 w-full appearance-none border-b bg-transparent pb-1 pr-6 text-sm text-gray-200 focus:outline-none transition-colors ${
            error
              ? "border-feedback-danger"
              : "border-gray-500 focus:border-blue-base"
          }`}
          {...rest}
        >
          {placeholder && (
            <option value="" hidden>
              {placeholder}
            </option>
          )}
          {options?.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>

      {error && <p className="mt-1 text-xs text-feedback-danger">{error}</p>}
      {helper && <p className="text-[12px] italic text-gray-400">{helper}</p>}
    </div>
  );
}

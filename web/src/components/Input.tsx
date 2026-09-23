import type { ReactNode } from "react";

type Props = Omit<React.ComponentProps<"input">, "onChange"> & {
  label?: string;
  error?: string[];
  helper?: string;
  onChange?: (value: string) => void;
  trailing?: ReactNode;
};

export function Input({
  label,
  helper,
  onChange,
  type = "text",
  error,
  trailing,
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

      {trailing ? (
        <div className="flex items-center justify-between gap-3 border-b border-gray-500">
          <input
            type={type}
            onChange={(event) => onChange?.(event.target.value)}
            className="w-full text-sm placeholder:text-gray-400 focus:outline-none bg-transparent"
            {...rest}
          />
          {trailing}
        </div>
      ) : (
        <input
          type={type}
          onChange={(event) => onChange?.(event.target.value)}
          className="w-full border-b border-gray-500 pb-1 text-sm text-gray-200 placeholder:text-gray-400 focus:border-blue-base focus:outline-none bg-transparent transition-colors"
          {...rest}
        />
      )}

      {error && (
        <p className="mt-1 block text-xs text-feedback-danger">{error}</p>
      )}
      {helper && <p className="text-gray-400 italic text-[12px]">{helper}</p>}
    </div>
  );
}

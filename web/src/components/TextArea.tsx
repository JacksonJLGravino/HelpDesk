type Props = Omit<React.ComponentProps<"textarea">, "onChange"> & {
  label?: string;
  onChange?: (value: string) => void;
};

export function TextArea({
  label,
  onChange,

  ...rest
}: Props) {
  return (
    <div className="group">
      <label
        className={
          "block text-xs uppercase font-bold  group-has-focus:text-blue-base text-gray-300 transition-colors "
        }
      >
        {label}
      </label>

      <textarea
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full border-b border-gray-500 pb-1 mt-2 text-sm text-gray-200 resize-none placeholder:text-gray-400 focus:border-blue-base focus:outline-none bg-transparent transition-colors"
        {...rest}
      />
    </div>
  );
}

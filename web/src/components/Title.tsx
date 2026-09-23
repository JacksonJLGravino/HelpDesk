type Props = {
  title?: string;
  subtitle?: string;
};

export function Title({ title, subtitle }: Props) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-200">{title}</h3>
      <p className=" text-xs text-gray-300">{subtitle}</p>
    </div>
  );
}

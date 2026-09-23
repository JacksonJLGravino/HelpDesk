import { classMerge } from "../utils/classMerge";

type Props = React.ComponentProps<"button"> & {
  color?: "default" | "secondary" | "link";
  size?: "sm" | "lg";
};

const variants = {
  btnColor: {
    default: "bg-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-600",
    secondary:
      "bg-gray-500 text-gray-200 hover:bg-gray-400 hover:text-gray-100",
    link: "text-gray-300 hover:bg-gray-500 hover:text-gray-100 ",
  },
  btnSize: {
    sm: "px-1.75 h-7",
    lg: "px-4 h-10",
  },
};

export function Button({
  color = "default",
  size = "lg",
  className,
  ...rest
}: Props) {
  return (
    <button
      type="submit"
      className={classMerge([
        "transition-colors text-sm font-semibold p- rounded-md cursor-pointer",
        variants.btnColor[color],
        variants.btnSize[size],
        className,
      ])}
      {...rest}
    ></button>
  );
}

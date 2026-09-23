type Props = React.ComponentProps<"a"> & {
  href: string;
};

export function LinkBtn({ href, ...rest }: Props) {
  return (
    <a
      href={href}
      className="text-center w-full transition-colors text-sm font-semibold rounded-md p-2.5 cursor-pointer bg-gray-500 text-gray-200 hover:bg-gray-400 hover:text-gray-100"
      {...rest}
    ></a>
  );
}

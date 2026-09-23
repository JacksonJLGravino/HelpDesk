import type { ReactNode } from "react";
import { classMerge } from "../utils/classMerge";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-500">
      <table className="w-full text-left">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-gray-500 text-sm font-bold text-gray-400">
        {children}
      </tr>
    </thead>
  );
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b text-gray-200 text-sm border-gray-500 last:border-0 hover:bg-gray-500">
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  align = "left",
  className,
}: {
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={classMerge([
        "px-3 py-5",
        align === "right" ? "text-right" : "",
        className,
      ])}
    >
      {children}
    </td>
  );
}

export function TableHeaderCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th className={classMerge(["px-3 py-3.5 font-normal", className])}>
      {children}
    </th>
  );
}

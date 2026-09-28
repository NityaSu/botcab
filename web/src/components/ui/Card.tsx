import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

/** White surface card used across rider/driver consoles. */
export function Card({ className = "", children, ...rest }: Props) {
  return (
    <div
      className={`bg-white rounded-2xl border border-neutral-200 shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

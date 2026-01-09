import type { ReactNode } from "react";

export const AppInput = ({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) => {
  return (
    <div>
      {label ? (
        <span className="relative top-[3px] text-sm">{label}</span>
      ) : null}
      <div className="opacity-100">{children}</div>
    </div>
  );
};

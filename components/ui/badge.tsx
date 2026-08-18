import type { ReactNode } from "react";

const VARIANTS = {
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  neutral: "bg-gray-50 text-gray-500 border-gray-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
};

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: {
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

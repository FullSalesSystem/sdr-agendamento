"use client";

import { STATUS_COLORS, PRODUTO_COLORS } from "@/lib/constants";

interface BadgeProps {
  label: string;
  size?: "sm" | "md";
}

const fallback = { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" };

export default function Badge({ label, size = "sm" }: BadgeProps) {
  const colors = STATUS_COLORS[label] || PRODUTO_COLORS[label] || fallback;
  const sizeClasses = size === "sm"
    ? "text-[10px] px-1.5 py-px"
    : "text-xs px-2.5 py-0.5";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md border whitespace-nowrap shrink-0 ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
    >
      {label}
    </span>
  );
}

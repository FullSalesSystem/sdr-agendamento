"use client";

import { STATUS_COLORS, PRODUTO_COLORS } from "@/lib/constants";

interface BadgeProps {
  label: string;
}

export default function Badge({ label }: BadgeProps) {
  const colors = STATUS_COLORS[label] || PRODUTO_COLORS[label] || {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-300",
  };

  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {label}
    </span>
  );
}

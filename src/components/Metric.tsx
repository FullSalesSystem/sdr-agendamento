"use client";

interface MetricProps {
  label: string;
  value: number;
  color?: string;
  icon?: string;
}

const colorMap: Record<string, { border: string; text: string; bg: string; iconBg: string }> = {
  blue: { border: "border-t-blue-500", text: "text-blue-600", bg: "from-blue-50/50", iconBg: "bg-blue-100 text-blue-600" },
  amber: { border: "border-t-amber-500", text: "text-amber-600", bg: "from-amber-50/50", iconBg: "bg-amber-100 text-amber-600" },
  red: { border: "border-t-red-500", text: "text-red-600", bg: "from-red-50/50", iconBg: "bg-red-100 text-red-600" },
  green: { border: "border-t-green-500", text: "text-green-600", bg: "from-green-50/50", iconBg: "bg-green-100 text-green-600" },
};

export default function Metric({ label, value, color = "blue" }: MetricProps) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-gradient-to-b ${c.bg} to-white rounded-xl p-4 flex-1 min-w-[100px] border border-slate-100 border-t-[3px] ${c.border} card-hover`}>
      <div className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
        {label}
      </div>
      <div className={`text-2xl font-bold leading-none ${c.text} tabular-nums`}>{value}</div>
    </div>
  );
}

"use client";

interface MetricProps {
  label: string;
  value: number;
  color?: string;
}

const colorMap: Record<string, { border: string; text: string }> = {
  blue: { border: "border-t-blue-600", text: "text-blue-600" },
  amber: { border: "border-t-amber-600", text: "text-amber-600" },
  red: { border: "border-t-red-600", text: "text-red-600" },
  green: { border: "border-t-green-600", text: "text-green-600" },
};

export default function Metric({ label, value, color = "blue" }: MetricProps) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-xl p-4 flex-1 min-w-[90px] border border-slate-100 border-t-[3px] ${c.border}`}>
      <div className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
        {label}
      </div>
      <div className={`text-2xl font-bold leading-none ${c.text}`}>{value}</div>
    </div>
  );
}

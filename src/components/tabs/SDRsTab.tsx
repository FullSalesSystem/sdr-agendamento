"use client";

import { useMemo } from "react";
import type { Agendamento, SDRStats } from "@/lib/types";
import { MESES, ACTIVE_STATUSES } from "@/lib/constants";

interface Props {
  agendamentos: Agendamento[];
  sdrs: string[];
  selM: number;
}

export default function SDRsTab({ agendamentos, sdrs, selM }: Props) {
  const bySDR: SDRStats[] = useMemo(
    () =>
      sdrs.map((s) => {
        const mine = agendamentos.filter((a) => a.sdr === s);
        return {
          name: s,
          ag: mine.filter((a) => ACTIVE_STATUSES.includes(a.status)).length,
          re: mine.filter((a) => a.status === "Reagendamento").length,
          tot: mine.length,
          ps: [...new Set(mine.map((a) => a.produto).filter(Boolean))].join(", ") || "—",
        };
      }),
    [agendamentos, sdrs]
  );

  const colors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="font-bold text-sm text-slate-800">SDRs</div>
        <div className="text-xs text-slate-400">{MESES[selM]} — desempenho individual</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80">
              {["SDR", "Agendamentos", "Reagend.", "Total", "Produtos"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-semibold text-slate-400 border-b border-slate-100 text-[11px] uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bySDR.map((s, i) => (
              <tr key={s.name} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${colors[i % colors.length]} flex items-center justify-center text-white text-xs font-bold`}>
                      {s.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-800">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold text-blue-600 tabular-nums">{s.ag}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold text-amber-600 tabular-nums">{s.re}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold text-slate-700 tabular-nums">{s.tot}</span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs max-w-[200px] truncate">{s.ps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

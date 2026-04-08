"use client";

import { useMemo } from "react";
import type { Agendamento, SDRStats } from "@/lib/types";
import { MESES } from "@/lib/constants";

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
          ag: mine.filter((a) => a.status === "Agendamento").length,
          re: mine.filter((a) => a.status === "Reagendamento").length,
          tot: mine.length,
          ps: [...new Set(mine.map((a) => a.produto).filter(Boolean))].join(", ") || "—",
        };
      }),
    [agendamentos, sdrs]
  );

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="font-bold text-xs mb-3.5 uppercase tracking-wider text-slate-500">
        SDRs — {MESES[selM]}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {["SDR", "Agendamentos", "Reagend.", "Total", "Produtos"].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left font-bold text-slate-500 border-b-2 border-slate-200 text-[11px] uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bySDR.map((s, i) => (
              <tr key={s.name} className={`border-b border-slate-100 ${i % 2 ? "bg-slate-50" : "bg-white"}`}>
                <td className="px-3 py-2 font-bold">{s.name}</td>
                <td className="px-3 py-2 text-blue-600 font-semibold">{s.ag}</td>
                <td className="px-3 py-2 text-amber-600 font-semibold">{s.re}</td>
                <td className="px-3 py-2 font-semibold">{s.tot}</td>
                <td className="px-3 py-2 text-slate-400 text-xs">{s.ps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

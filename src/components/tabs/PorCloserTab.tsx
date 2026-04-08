"use client";

import { useMemo } from "react";
import Metric from "@/components/Metric";
import type { Agendamento, CloserStats } from "@/lib/types";
import { MESES } from "@/lib/constants";

interface Props {
  agendamentos: Agendamento[];
  closers: string[];
  selM: number;
}

const avatarColors = [
  "from-blue-500 to-blue-600",
  "from-violet-500 to-violet-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
];

export default function PorCloserTab({ agendamentos, closers, selM }: Props) {
  const byCloser: CloserStats[] = useMemo(
    () =>
      closers.map((c) => ({
        name: c,
        ag: agendamentos.filter((a) => a.closer === c && a.status === "Agendamento").length,
        re: agendamentos.filter((a) => a.closer === c && a.cancel_motivo === "Lead pediu para reagendar").length,
        bl: agendamentos.filter(
          (a) =>
            a.closer === c &&
            a.cancel_motivo !== null &&
            a.cancel_motivo !== "Lead pediu para reagendar" &&
            a.cancel_motivo !== "No show"
        ).length,
        ns: agendamentos.filter((a) => a.closer === c && a.cancel_motivo === "No show").length,
      })),
    [agendamentos, closers]
  );

  return (
    <div className="space-y-4">
      {byCloser.map((c, i) => (
        <div key={c.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 card-hover">
          <div className="flex items-center gap-3.5 mb-4 pb-4 border-b border-slate-100">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center font-bold text-lg text-white shadow-sm`}>
              {c.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-base text-slate-800">{c.name}</div>
              <div className="text-xs text-slate-400">Closer — {MESES[selM]}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <Metric label="Agendamentos" value={c.ag} color="blue" />
            <Metric label="Reagendamentos" value={c.re} color="amber" />
            <Metric label="Bloqueados" value={c.bl} color="red" />
            <Metric label="No show" value={c.ns} color="red" />
          </div>
        </div>
      ))}
      {agendamentos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-300 text-3xl mb-2">0</div>
          <div className="text-slate-400 text-sm">Nenhum agendamento em {MESES[selM]}</div>
        </div>
      )}
    </div>
  );
}

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
    <div className="flex flex-col gap-3">
      {byCloser.map((c) => (
        <div key={c.name} className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-3 mb-3.5 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-bold text-base text-blue-600">
              {c.name[0]}
            </div>
            <div className="font-bold text-base">{c.name}</div>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <Metric label="Agendamentos" value={c.ag} color="blue" />
            <Metric label="Reagendamentos" value={c.re} color="amber" />
            <Metric label="Bloqueados" value={c.bl} color="red" />
            <Metric label="No show" value={c.ns} color="red" />
          </div>
        </div>
      ))}
      {agendamentos.length === 0 && (
        <div className="text-center text-slate-400 text-sm mt-6">
          Nenhum agendamento em {MESES[selM]}.
        </div>
      )}
    </div>
  );
}

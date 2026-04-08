"use client";

import { useMemo } from "react";
import Metric from "@/components/Metric";
import type { Agendamento } from "@/lib/types";
import { MESES } from "@/lib/constants";

interface Props {
  agendamentos: Agendamento[];
  produtos: string[];
  selM: number;
}

export default function RelatorioTab({ agendamentos, produtos, selM }: Props) {
  const mAgs = agendamentos;

  const totAg = mAgs.filter((a) => a.status === "Agendamento").length;
  const totRe = mAgs.filter((a) => a.status === "Reagendamento").length;
  const totBl = mAgs.filter((a) => a.status === "Bloqueado").length;
  const totNS = mAgs.filter((a) => a.motivo === "No show").length;

  const prodStats = useMemo(() => {
    return produtos.map((p) => {
      const cnt = mAgs.filter((a) => a.produto === p).length;
      const pct = mAgs.length ? Math.round((cnt / mAgs.length) * 100) : 0;
      return { p, cnt, pct };
    });
  }, [mAgs, produtos]);

  const colorMap: Record<string, string> = {
    Aceleração: "bg-blue-600",
    Bloqueia: "bg-red-600",
    Livre: "bg-slate-400",
    Formação: "bg-amber-600",
    Ativação: "bg-violet-600",
    Overbook: "bg-slate-500",
  };

  return (
    <div>
      <div className="flex gap-3 mb-5 flex-wrap">
        <Metric label="Agendamentos" value={totAg} color="blue" />
        <Metric label="Reagendamentos" value={totRe} color="amber" />
        <Metric label="Bloqueados" value={totBl} color="red" />
        <Metric label="No show" value={totNS} color="red" />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="font-bold text-xs mb-4 uppercase tracking-wider text-slate-500">
          Por produto — {MESES[selM]}
        </div>
        {prodStats.map(({ p, cnt, pct }) => (
          <div key={p} className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold">{p}</span>
              <span className="text-slate-400 font-semibold">{cnt}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-400 ${colorMap[p] || "bg-blue-600"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}
        {mAgs.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-4">
            Nenhum agendamento em {MESES[selM]}.
          </div>
        )}
      </div>
    </div>
  );
}

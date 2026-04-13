"use client";

import { useMemo } from "react";
import Metric from "@/components/Metric";
import type { Agendamento } from "@/lib/types";
import { ACTIVE_STATUSES } from "@/lib/constants";
import { MESES } from "@/lib/constants";

interface Props {
  agendamentos: Agendamento[];
  produtos: string[];
  selM: number;
}

export default function RelatorioTab({ agendamentos, produtos, selM }: Props) {
  const mAgs = agendamentos;

  const totAg = mAgs.filter((a) => ACTIVE_STATUSES.includes(a.status)).length;
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
    Aceleração: "bg-blue-500",
    Bloqueia: "bg-red-500",
    Livre: "bg-slate-400",
    Formação: "bg-amber-500",
    Ativação: "bg-violet-500",
    Overbook: "bg-slate-500",
  };

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Metric label="Agendamentos" value={totAg} color="blue" />
        <Metric label="Reagendamentos" value={totRe} color="amber" />
        <Metric label="Bloqueados" value={totBl} color="red" />
        <Metric label="No show" value={totNS} color="red" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="font-bold text-sm text-slate-800">Por produto</div>
            <div className="text-xs text-slate-400">{MESES[selM]} — {mAgs.length} total</div>
          </div>
        </div>

        <div className="space-y-4">
          {prodStats.map(({ p, cnt, pct }) => (
            <div key={p}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold text-slate-700">{p}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 tabular-nums">{pct}%</span>
                  <span className="text-sm font-bold text-slate-600 tabular-nums min-w-[20px] text-right">{cnt}</span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colorMap[p] || "bg-blue-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {mAgs.length === 0 && (
          <div className="text-center py-8">
            <div className="text-slate-300 text-3xl mb-2">0</div>
            <div className="text-slate-400 text-sm">Nenhum agendamento em {MESES[selM]}</div>
          </div>
        )}
      </div>
    </div>
  );
}

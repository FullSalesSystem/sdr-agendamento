"use client";

import { useMemo } from "react";
import Badge from "@/components/Badge";
import type { Agendamento } from "@/lib/types";
import { MESES } from "@/lib/constants";
import { parseDate } from "@/lib/utils";

interface Props {
  agendamentos: Agendamento[];
  motivos: string[];
  selM: number;
}

export default function CancelamentosTab({ agendamentos, motivos, selM }: Props) {
  const cancels = useMemo(
    () => agendamentos.filter((a) => a.cancel_motivo),
    [agendamentos]
  );

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {motivos.map((m) => {
          const count = cancels.filter((a) => a.cancel_motivo === m).length;
          return (
            <div
              key={m}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm border-t-[3px] border-t-red-500 p-4 card-hover"
            >
              <div className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                {m}
              </div>
              <div className="text-3xl font-bold text-red-600 tabular-nums">{count}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="font-bold text-sm text-slate-800">Historico</div>
            <div className="text-xs text-slate-400">{MESES[selM]}</div>
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 rounded-full px-3 py-1">
            {cancels.length} ocorrencia{cancels.length !== 1 ? "s" : ""}
          </span>
        </div>

        {cancels.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-slate-400 text-sm">Nenhum cancelamento em {MESES[selM]}</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80">
                  {["Data", "Hora", "Closer", "SDR", "Produto", "Status", "Motivo", "Obs."].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-3 text-left font-semibold text-slate-400 border-b border-slate-100 text-[11px] uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {cancels
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((a, i) => (
                    <tr
                      key={a.id}
                      className={`border-b border-slate-50 hover:bg-red-50/30 transition-colors ${i % 2 ? "bg-slate-50/30" : ""}`}
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap font-semibold text-slate-700">
                        {parseDate(a.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 tabular-nums">{a.horario}</td>
                      <td className="px-3 py-2.5 font-bold text-blue-600">{a.closer || "—"}</td>
                      <td className="px-3 py-2.5 text-slate-500">{a.sdr || "—"}</td>
                      <td className="px-3 py-2.5">
                        {a.produto ? <Badge label={a.produto} size="md" /> : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        {a.status ? <Badge label={a.status} size="md" /> : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-red-600 font-semibold text-xs bg-red-50 border border-red-100 rounded-md px-2 py-0.5 whitespace-nowrap">
                          {a.cancel_motivo}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-400 text-xs max-w-[150px] truncate">{a.obs || "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

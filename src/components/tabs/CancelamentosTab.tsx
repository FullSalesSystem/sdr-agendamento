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
      <div className="flex gap-3 mb-3.5 flex-wrap">
        {motivos.map((m) => (
          <div
            key={m}
            className="bg-white rounded-xl flex-1 min-w-[120px] border border-slate-100 border-t-[3px] border-t-red-600 p-4"
          >
            <div className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              {m}
            </div>
            <div className="text-2xl font-bold text-red-600">
              {cancels.filter((a) => a.cancel_motivo === m).length}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="font-bold text-xs mb-3.5 uppercase tracking-wider text-slate-500 flex justify-between">
          <span>Histórico — {MESES[selM]}</span>
          <span className="font-normal text-xs normal-case text-slate-400">
            {cancels.length} ocorrência{cancels.length !== 1 ? "s" : ""}
          </span>
        </div>

        {cancels.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-4">
            Nenhum cancelamento em {MESES[selM]}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  {["Data", "Hora", "Closer", "SDR", "Produto", "Status", "Motivo", "Obs."].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-2.5 py-2 text-left font-bold text-slate-500 border-b-2 border-slate-200 text-[11px] uppercase whitespace-nowrap"
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
                      className={`border-b border-slate-100 ${i % 2 ? "bg-slate-50" : "bg-white"}`}
                    >
                      <td className="px-2.5 py-2 whitespace-nowrap font-semibold">
                        {parseDate(a.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-2.5 py-2">{a.horario}</td>
                      <td className="px-2.5 py-2 font-bold text-blue-600">{a.closer || "—"}</td>
                      <td className="px-2.5 py-2">{a.sdr || "—"}</td>
                      <td className="px-2.5 py-2">
                        {a.produto ? <Badge label={a.produto} /> : "—"}
                      </td>
                      <td className="px-2.5 py-2">
                        {a.status ? <Badge label={a.status} /> : "—"}
                      </td>
                      <td className="px-2.5 py-2 text-red-600 font-semibold whitespace-nowrap">
                        {a.cancel_motivo}
                      </td>
                      <td className="px-2.5 py-2 text-slate-400 text-xs">{a.obs || "—"}</td>
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

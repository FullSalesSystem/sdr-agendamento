"use client";

import { useMemo } from "react";
import Badge from "@/components/Badge";
import type { Agendamento, AgendamentoForm, GroupConfig } from "@/lib/types";
import {
  weekOf, monthDays, toWeeks, orderedHours, slotInfo,
  fmtDate, fmtDateBR, isSun, isSat, isToday, isSameDay,
} from "@/lib/utils";
import { DSEM } from "@/lib/constants";

interface Props {
  selM: number;
  selY: number;
  wDate: Date;
  agendamentos: Agendamento[];
  closers: string[];
  produtos: string[];
  configH1: GroupConfig;
  configH2: GroupConfig;
  onSelectWeek: (d: Date) => void;
  onOpenAdd: (date: Date, hour?: string) => void;
  onOpenEdit: (date: Date, ag: Agendamento) => void;
}

export default function AgendamentoTab({
  selM, selY, wDate, agendamentos, closers, produtos, configH1, configH2,
  onSelectWeek, onOpenAdd, onOpenEdit,
}: Props) {
  const week = useMemo(() => weekOf(wDate), [wDate]);
  const days = useMemo(() => monthDays(selY, selM), [selY, selM]);
  const weeks = useMemo(() => toWeeks(days), [days]);

  function dayCnt(date: Date | null): number {
    if (!date) return 0;
    const key = fmtDate(date);
    return agendamentos.filter((a) => a.date === key && !a.cancelado).length;
  }

  function dayMap(date: Date): Record<string, Agendamento[]> {
    const key = fmtDate(date);
    const map: Record<string, Agendamento[]> = {};
    agendamentos
      .filter((a) => a.date === key && !a.cancelado)
      .forEach((a) => {
        if (!map[a.horario]) map[a.horario] = [];
        map[a.horario].push(a);
      });
    return map;
  }

  function inWeek(d: Date | null): boolean {
    return d !== null && week.some((w) => isSameDay(w, d));
  }

  function getConfig(grp: "h1" | "h2") {
    return grp === "h1" ? configH1 : configH2;
  }

  function renderSlots(date: Date, h: string, dmap: Record<string, Agendamento[]>) {
    const { isOB, grp } = slotInfo(date, h);
    const cfg = getConfig(grp);
    const slots = dmap[h] || [];
    const rows: React.ReactNode[] = [];

    if (isOB) {
      for (let i = 0; i < cfg.overbook; i++) {
        const e = slots[i];
        rows.push(
          e ? (
            <div
              key={"ob" + i}
              onClick={() => onOpenEdit(date, e)}
              className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 cursor-pointer mb-0.5 flex items-center gap-1 overflow-hidden"
            >
              <span className="text-[10px] text-slate-600 font-bold shrink-0 uppercase">OB</span>
              {e.sdr && <span className="text-[10px] text-slate-500 whitespace-nowrap">{e.sdr}</span>}
              <Badge label={e.produto} />
              {e.status !== "Livre" && <Badge label={e.status} />}
            </div>
          ) : (
            <div
              key={"obe" + i}
              onClick={() => onOpenAdd(date, h)}
              className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded border border-dashed border-slate-300 cursor-pointer mb-0.5"
            >
              OB — livre
            </div>
          )
        );
      }
    } else {
      cfg.closers.forEach((cl) => {
        const e = slots.find((s) => s.closer === cl);
        rows.push(
          e ? (
            <div
              key={cl}
              onClick={() => onOpenEdit(date, e)}
              className="bg-white border border-slate-200 rounded px-1.5 py-0.5 cursor-pointer mb-0.5 flex items-center gap-1 overflow-hidden"
            >
              <span className="font-bold text-[11px] whitespace-nowrap shrink-0 text-blue-700">{cl}</span>
              {e.sdr && <span className="text-[10px] text-slate-500 whitespace-nowrap">{e.sdr}</span>}
              <Badge label={e.produto} />
              {e.status !== "Livre" && <Badge label={e.status} />}
            </div>
          ) : (
            <div
              key={cl + "e"}
              onClick={() => onOpenAdd(date, h)}
              className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded border border-dashed border-slate-100 cursor-pointer mb-0.5"
            >
              {cl} — livre
            </div>
          )
        );
      });
    }
    return rows;
  }

  const wLabel = (() => {
    const s = week[0], e = week[6];
    return `${fmtDateBR(s)} — ${fmtDateBR(e)}`;
  })();

  return (
    <div>
      {/* Mini calendar */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-3.5">
        <div className="grid grid-cols-7 gap-0.5 mb-1.5">
          {DSEM.map((d) => (
            <div key={d} className="text-center text-[11px] font-bold text-slate-400 uppercase">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((wk, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0.5 mb-0.5">
            {wk.map((d, di) => {
              const blk = isSun(d);
              const inW = d ? inWeek(d) : false;
              const cnt = d ? dayCnt(d) : 0;
              return (
                <div
                  key={di}
                  onClick={() => d && !blk && onSelectWeek(d)}
                  className={`min-h-[36px] rounded-md p-0.5 ${!d ? "opacity-0" : ""} ${
                    blk ? "bg-slate-100 cursor-default" :
                    inW ? "bg-blue-50 border-blue-400 cursor-pointer" :
                    "bg-white cursor-pointer"
                  } ${isToday(d) ? "border-2 border-blue-600" : inW && d ? "border border-blue-400" : "border border-slate-100"}`}
                >
                  {d && (
                    <>
                      <div className={`text-xs text-center ${isToday(d) ? "font-bold text-blue-600" : blk ? "text-slate-400" : inW ? "text-blue-600" : "text-slate-900"}`}>
                        {d.getDate()}
                      </div>
                      {cnt > 0 && (
                        <div className={`text-[10px] text-center font-semibold ${inW ? "text-blue-600" : "text-slate-400"}`}>
                          {cnt}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Week nav */}
      <div className="flex items-center gap-2.5 mb-3">
        <button
          onClick={() => {
            const d = new Date(wDate);
            d.setDate(d.getDate() - 7);
            onSelectWeek(d);
          }}
          className="py-1.5 px-4 rounded-md border border-slate-200 bg-white text-blue-600 font-bold text-lg hover:bg-slate-50"
        >
          ‹
        </button>
        <div className="flex-1 text-center font-bold text-sm">{wLabel}</div>
        <button
          onClick={() => {
            const d = new Date(wDate);
            d.setDate(d.getDate() + 7);
            onSelectWeek(d);
          }}
          className="py-1.5 px-4 rounded-md border border-slate-200 bg-white text-blue-600 font-bold text-lg hover:bg-slate-50"
        >
          ›
        </button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {week.map((date) => {
          const blk = isSun(date);
          const hrs = orderedHours(date);
          const dm = dayMap(date);

          return (
            <div
              key={fmtDate(date)}
              className={`rounded-xl overflow-hidden ${
                isToday(date) ? "border-2 border-blue-600" : "border border-slate-100"
              } ${blk ? "bg-slate-100 opacity-50" : "bg-white"}`}
            >
              {/* Day header */}
              <div className={`px-2 py-1.5 border-b border-slate-100 flex justify-between items-center ${isToday(date) ? "bg-blue-50" : "bg-slate-50"}`}>
                <div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${isToday(date) ? "text-blue-600" : "text-slate-400"}`}>
                    {DSEM[date.getDay()]}
                  </div>
                  <div className={`text-sm font-bold ${isToday(date) ? "text-blue-600" : "text-slate-900"}`}>
                    {fmtDateBR(date)}
                  </div>
                </div>
                {!blk && (
                  <button
                    onClick={() => onOpenAdd(date)}
                    className="w-6 h-6 rounded-md bg-blue-600 text-white text-base font-bold flex items-center justify-center hover:bg-blue-700"
                  >
                    +
                  </button>
                )}
              </div>

              {blk ? (
                <div className="p-2.5 text-[11px] text-slate-400 text-center font-semibold uppercase">
                  Fechado
                </div>
              ) : (
                <div className="p-1">
                  {hrs.map((h) => {
                    const { isOB } = slotInfo(date, h);
                    return (
                      <div key={h}>
                        <div className={`text-[10px] font-bold px-0.5 pt-1 pb-0.5 border-t border-slate-100 mt-0.5 ${isOB ? "text-slate-500" : "text-blue-600"}`}>
                          {h}
                          {isOB ? " · OB" : ""}
                        </div>
                        {renderSlots(date, h, dm)}
                      </div>
                    );
                  })}

                  {isSat(date) && (
                    <div className="text-[10px] text-slate-400 text-center mt-1.5 pt-1 border-t border-slate-100 font-semibold uppercase">
                      até 14h
                    </div>
                  )}

                  {/* Daily score */}
                  {(() => {
                    const entries = Object.values(dm).flat();
                    const counts = produtos.map((p) => ({ p, n: entries.filter((e) => e.produto === p).length }));

                    let totalSlots = 0;
                    hrs.forEach((h) => {
                      const { isOB, grp } = slotInfo(date, h);
                      const cfg = getConfig(grp);
                      totalSlots += isOB ? cfg.overbook : cfg.closers.length;
                    });
                    const filled = entries.length;
                    const free = Math.max(0, totalSlots - filled);

                    return (
                      <div className="mt-2 pt-1.5 border-t-2 border-blue-600 flex flex-col gap-0.5">
                        <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                          Placar
                        </div>
                        <div className={`flex justify-between items-center rounded px-1 py-0.5 ${free > 0 ? "bg-green-50" : ""}`}>
                          <span className={`text-[10px] font-bold ${free > 0 ? "text-green-700" : "text-slate-400"}`}>
                            Livres
                          </span>
                          <span className={`text-[11px] font-bold rounded px-1.5 min-w-[18px] text-center ${free > 0 ? "text-green-700 bg-green-100" : "text-slate-400"}`}>
                            {free}
                          </span>
                        </div>
                        {counts
                          .filter((x) => x.n > 0)
                          .map(({ p, n }) => (
                            <div key={p} className="flex justify-between items-center gap-1">
                              <span className="text-[10px] text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                                {p}
                              </span>
                              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 rounded px-1.5 min-w-[18px] text-center shrink-0">
                                {n}
                              </span>
                            </div>
                          ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

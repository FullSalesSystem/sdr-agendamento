"use client";

import { useMemo } from "react";
import Badge from "@/components/Badge";
import type { Agendamento, GroupConfig, Settings } from "@/lib/types";
import {
  weekOf, monthDays, toWeeks, orderedSlots, getHoursForDate,
  fmtDate, fmtDateBR, isSun, isSat, isToday, isSameDay, isActiveAg,
} from "@/lib/utils";
import { DSEM } from "@/lib/constants";

type HoursConfig = Pick<Settings, "horarios_h1" | "horarios_h2" | "horarios_h1_sab" | "horarios_h2_sab">;

interface Props {
  selM: number;
  selY: number;
  wDate: Date;
  agendamentos: Agendamento[];
  closers: string[];
  produtos: string[];
  configH1: GroupConfig;
  configH2: GroupConfig;
  hoursConfig: HoursConfig;
  onSelectWeek: (d: Date) => void;
  onOpenAdd: (date: Date, hour?: string) => void;
  onOpenEdit: (date: Date, ag: Agendamento) => void;
}

export default function AgendamentoTab({
  selM, selY, wDate, agendamentos, produtos, configH1, configH2, hoursConfig,
  onSelectWeek, onOpenAdd, onOpenEdit,
}: Props) {
  const week = useMemo(() => weekOf(wDate), [wDate]);
  const days = useMemo(() => monthDays(selY, selM), [selY, selM]);
  const weeks = useMemo(() => toWeeks(days), [days]);

  function dayCnt(date: Date | null): number {
    if (!date) return 0;
    const key = fmtDate(date);
    return agendamentos.filter((a) => a.date === key && isActiveAg(a)).length;
  }

  // Key format: "HH:MM|grp" — separates H1 and H2 entries at the same hour
  function dayMap(date: Date): Record<string, Agendamento[]> {
    const key = fmtDate(date);
    const { h1, h2 } = (() => {
      const sat = isSat(date);
      const h1 = sat ? (hoursConfig.horarios_h1_sab ?? []) : (hoursConfig.horarios_h1 ?? []);
      const h2 = sat ? (hoursConfig.horarios_h2_sab ?? []) : (hoursConfig.horarios_h2 ?? []);
      return { h1, h2 };
    })();

    const map: Record<string, Agendamento[]> = {};

    agendamentos
      .filter((a) => a.date === key && a.cancelado !== true && !a.cancel_motivo)
      .forEach((a) => {
        const [hh, mm] = a.horario.split(":");
        const isOB = mm === "10";
        const inH1 = h1.includes(hh);
        const inH2 = h2.includes(hh);

        const push = (grp: "h1" | "h2") => {
          const slotKey = `${a.horario}|${grp}`;
          if (!map[slotKey]) map[slotKey] = [];
          map[slotKey].push(a);
        };

        const h1Closers: string[] = configH1?.closers ?? [];
        const h2Closers: string[] = configH2?.closers ?? [];

        if (isOB) {
          // OB: route to exactly ONE group based on which group's closers list
          // contains this closer — keeps H1 OB and H2 OB fully independent.
          const inH1Closers = h1Closers.includes(a.closer);
          const inH2Closers = h2Closers.includes(a.closer);
          // H2 priority if closer appears in both (shouldn't happen, but safe)
          const grp = inH2Closers ? "h2" : inH1Closers ? "h1" : inH2 ? "h2" : "h1";
          if (inH1 || inH2) push(grp);
        } else {
          // Regular slot: route per group by closer membership
          if (inH1 && h1Closers.includes(a.closer)) push("h1");
          if (inH2 && h2Closers.includes(a.closer)) push("h2");
          // Fallback: hour not in any configured group (legacy data)
          if (!inH1 && !inH2) push("h2");
        }
      });
    return map;
  }

  function inWeek(d: Date | null): boolean {
    return d !== null && week.some((w) => isSameDay(w, d));
  }

  function getConfig(grp: "h1" | "h2"): GroupConfig {
    const cfg = grp === "h1" ? configH1 : configH2;
    // Guard: if DB returned null for config (column added after row creation)
    return cfg ?? { closers: [], overbook: 0 };
  }

  function renderSlots(date: Date, h: string, grp: "h1" | "h2", dmap: Record<string, Agendamento[]>) {
    const isOB = h.endsWith(":10");
    const cfg = getConfig(grp);
    const slots = dmap[`${h}|${grp}`] || [];
    const rows: React.ReactNode[] = [];

    if (isOB) {
      for (let i = 0; i < cfg.overbook; i++) {
        const e = slots[i];
        rows.push(
          e ? (
            <div
              key={"ob" + i}
              onClick={() => onOpenEdit(date, e)}
              className="slot-entry bg-slate-50/80 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer mb-1 flex items-center gap-1.5 overflow-hidden"
            >
              <span className="text-[9px] text-slate-500 font-bold shrink-0 uppercase bg-slate-200/60 rounded px-1 py-px">OB</span>
              {e.closer && <span className="font-bold text-[11px] whitespace-nowrap shrink-0 text-blue-600">{e.closer}</span>}
              {e.sdr && <span className="text-[10px] text-slate-400 whitespace-nowrap truncate">{e.sdr}</span>}
              <Badge label={e.produto} />
              {e.status !== "Livre" && <Badge label={e.status} />}
            </div>
          ) : (
            <div
              key={"obe" + i}
              onClick={() => onOpenAdd(date, h)}
              className="text-[10px] text-slate-300 px-2 py-1 rounded-lg border border-dashed border-slate-200 cursor-pointer mb-1 hover:border-blue-300 hover:text-blue-400 hover:bg-blue-50/30 transition-all text-center"
            >
              + OB
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
              className="slot-entry bg-white border border-slate-200 rounded-lg px-2 py-1 cursor-pointer mb-1 flex items-center gap-1.5 overflow-hidden hover:border-blue-300"
            >
              <span className="font-bold text-[11px] whitespace-nowrap shrink-0 text-blue-600">{cl}</span>
              {e.sdr && <span className="text-[10px] text-slate-400 whitespace-nowrap truncate">{e.sdr}</span>}
              <Badge label={e.produto} />
              {e.status !== "Livre" && <Badge label={e.status} />}
            </div>
          ) : (
            <div
              key={cl + "e"}
              onClick={() => onOpenAdd(date, h)}
              className="text-[10px] text-slate-300 px-2 py-1 rounded-lg border border-dashed border-slate-100 cursor-pointer mb-1 hover:border-blue-300 hover:text-blue-400 hover:bg-blue-50/30 transition-all"
            >
              <span className="font-medium text-slate-400">{cl}</span> — livre
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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4">
        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {DSEM.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((wk, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {wk.map((d, di) => {
              const blk = isSun(d);
              const inW = d ? inWeek(d) : false;
              const cnt = d ? dayCnt(d) : 0;
              const today = isToday(d);
              return (
                <div
                  key={di}
                  onClick={() => d && !blk && onSelectWeek(d)}
                  className={`min-h-[40px] rounded-lg p-1 transition-all duration-150 ${!d ? "opacity-0" : ""} ${
                    blk ? "bg-slate-50 cursor-default" :
                    today ? "bg-blue-600 cursor-pointer shadow-md shadow-blue-600/20" :
                    inW ? "bg-blue-50 border border-blue-200 cursor-pointer" :
                    "bg-white hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200"
                  }`}
                >
                  {d && (
                    <>
                      <div className={`text-xs text-center font-medium ${
                        today ? "text-white font-bold" :
                        blk ? "text-slate-300" :
                        inW ? "text-blue-600 font-semibold" :
                        "text-slate-600"
                      }`}>
                        {d.getDate()}
                      </div>
                      {cnt > 0 && (
                        <div className={`text-[10px] text-center font-bold ${
                          today ? "text-blue-200" : inW ? "text-blue-500" : "text-slate-400"
                        }`}>
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
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => {
            const d = new Date(wDate);
            d.setDate(d.getDate() - 7);
            onSelectWeek(d);
          }}
          className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-blue-600 font-bold text-lg flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
        >
          ‹
        </button>
        <div className="flex-1 text-center">
          <div className="font-bold text-sm text-slate-800">{wLabel}</div>
          <div className="text-[11px] text-slate-400">semana selecionada</div>
        </div>
        <button
          onClick={() => {
            const d = new Date(wDate);
            d.setDate(d.getDate() + 7);
            onSelectWeek(d);
          }}
          className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-blue-600 font-bold text-lg flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
        >
          ›
        </button>
      </div>

      {/* Week grid */}
      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 pb-2">
      <div className="grid grid-cols-7 gap-2 min-w-[900px]">
        {week.map((date) => {
          const blk = isSun(date);
          const slots = orderedSlots(date, hoursConfig);
          const dm = dayMap(date);
          const today = isToday(date);

          return (
            <div
              key={fmtDate(date)}
              className={`rounded-2xl overflow-hidden shadow-sm ${
                today ? "ring-2 ring-blue-500 ring-offset-1" : "border border-slate-100"
              } ${blk ? "bg-slate-50 opacity-40" : "bg-white"}`}
            >
              {/* Day header */}
              <div className={`px-2.5 py-2 border-b flex justify-between items-center ${
                today ? "bg-blue-600 border-blue-600" : "bg-slate-50/80 border-slate-100"
              }`}>
                <div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${today ? "text-blue-200" : "text-slate-400"}`}>
                    {DSEM[date.getDay()]}
                  </div>
                  <div className={`text-sm font-bold ${today ? "text-white" : "text-slate-800"}`}>
                    {fmtDateBR(date)}
                  </div>
                </div>
                {!blk && (
                  <button
                    onClick={() => onOpenAdd(date)}
                    className={`w-7 h-7 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                      today
                        ? "bg-white/20 text-white hover:bg-white/30"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20"
                    }`}
                  >
                    +
                  </button>
                )}
              </div>

              {blk ? (
                <div className="p-3 text-[11px] text-slate-300 text-center font-semibold uppercase">
                  Fechado
                </div>
              ) : (
                <div className="p-1.5">
                  {slots.map(({ h, grp }) => {
                    const isOB = h.endsWith(":10");
                    return (
                      <div key={`${h}|${grp}`}>
                        <div className={`text-[10px] font-bold px-1 pt-1.5 pb-0.5 mt-0.5 flex items-center gap-1.5 ${isOB ? "text-slate-400" : "text-blue-600"}`}>
                          <span className={`w-1 h-1 rounded-full ${isOB ? "bg-slate-300" : "bg-blue-400"}`} />
                          {h}
                          {isOB && <span className="text-[9px] font-semibold text-slate-300 uppercase">OB</span>}
                          <span className="text-[9px] font-semibold text-slate-300 uppercase">{grp.toUpperCase()}</span>
                        </div>
                        {renderSlots(date, h, grp, dm)}
                      </div>
                    );
                  })}

                  {isSat(date) && (() => {
                    const { h1, h2 } = getHoursForDate(date, hoursConfig);
                    const maxH = Math.max(...[...h1, ...h2].map(Number));
                    return (
                      <div className="text-[10px] text-slate-300 text-center mt-2 pt-1.5 border-t border-slate-100 font-semibold uppercase">
                        ate {maxH}h
                      </div>
                    );
                  })()}

                  {/* Daily score */}
                  {(() => {
                    // Placard uses exactly what is VISIBLE in the grid (dm)
                    // If it shows in the grid and is active → counts. Otherwise → Livre.
                    // Use a Set to deduplicate appointments that appear in both H1 and H2 slots
                    const visibleIds = new Set<string>();
                    Object.values(dm).flat().forEach((a) => visibleIds.add(a.id));
                    const visible = [...visibleIds].map((id) =>
                      agendamentos.find((a) => a.id === id)!
                    ).filter(Boolean);
                    const activeForDay = visible.filter(isActiveAg);
                    const counts = produtos.map((p) => ({ p, n: activeForDay.filter((e) => e.produto === p).length }));

                    let totalSlots = 0;
                    slots.forEach(({ h, grp }) => {
                      const isOB = h.endsWith(":10");
                      const cfg = getConfig(grp);
                      totalSlots += isOB ? cfg.overbook : cfg.closers.length;
                    });
                    const filled = activeForDay.length;
                    const free = Math.max(0, totalSlots - filled);
                    const pct = totalSlots > 0 ? Math.round((filled / totalSlots) * 100) : 0;

                    return (
                      <div className="mt-2 pt-2 border-t-2 border-blue-100">
                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct === 100 ? "bg-emerald-500" : pct > 50 ? "bg-blue-500" : "bg-blue-300"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 tabular-nums">{pct}%</span>
                        </div>

                        <div className={`flex justify-between items-center rounded-lg px-1.5 py-0.5 ${free > 0 ? "bg-emerald-50" : "bg-slate-50"}`}>
                          <span className={`text-[10px] font-semibold ${free > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                            Livres
                          </span>
                          <span className={`text-[11px] font-bold rounded px-1.5 min-w-[18px] text-center tabular-nums ${
                            free > 0 ? "text-emerald-600" : "text-slate-400"
                          }`}>
                            {free}
                          </span>
                        </div>
                        {counts
                          .filter((x) => x.n > 0)
                          .map(({ p, n }) => (
                            <div key={p} className="flex justify-between items-center gap-1 px-1.5 py-px">
                              <span className="text-[10px] text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                                {p}
                              </span>
                              <span className="text-[10px] font-bold text-blue-600 tabular-nums">
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
    </div>
  );
}

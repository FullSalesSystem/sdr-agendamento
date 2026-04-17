"use client";

import { useState } from "react";
import TagList from "@/components/TagList";
import type { Settings, GroupConfig } from "@/lib/types";

interface Props {
  settings: Settings;
  onSave: (newSettings: Partial<Omit<Settings, "id" | "user_id">>) => void;
}

const EDITABLE_KEYS = [
  "closers", "sdrs", "produtos", "motivos",
  "config_h1", "config_h2",
  "horarios_h1", "horarios_h2", "horarios_h1_sab", "horarios_h2_sab",
] as const;

function hasChanges(a: Settings, b: Settings): boolean {
  return EDITABLE_KEYS.some((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
}

export default function ConfiguracoesTab({ settings, onSave }: Props) {
  const [local, setLocal] = useState<Settings>(settings);
  const [newHour, setNewHour] = useState<Record<string, string>>({});

  // After save, settings prop updates (optimistic) and changed becomes false naturally
  const changed = hasChanges(local, settings);

  const { closers, sdrs, produtos, motivos, config_h1, config_h2, horarios_h1, horarios_h2, horarios_h1_sab, horarios_h2_sab } = local;

  function updCfg(grp: "h1" | "h2", key: keyof GroupConfig, value: GroupConfig[keyof GroupConfig]) {
    setLocal((prev) => {
      const cfgKey = grp === "h1" ? "config_h1" : "config_h2";
      const cfg = { ...prev[cfgKey], [key]: value };
      return { ...prev, [cfgKey]: cfg };
    });
  }

  function addHour(key: "horarios_h1" | "horarios_h2" | "horarios_h1_sab" | "horarios_h2_sab") {
    const val = (newHour[key] || "").trim();
    if (!val) return;
    const n = parseInt(val);
    if (isNaN(n) || n < 0 || n > 23) return;
    const h = String(n);
    // Opposite key mapping — a hora só pode existir em um grupo por vez
    const opposite: Record<string, "horarios_h1" | "horarios_h2" | "horarios_h1_sab" | "horarios_h2_sab"> = {
      horarios_h1: "horarios_h2",
      horarios_h2: "horarios_h1",
      horarios_h1_sab: "horarios_h2_sab",
      horarios_h2_sab: "horarios_h1_sab",
    };
    setLocal((prev) => {
      if (prev[key].includes(h)) return prev; // já existe no mesmo grupo
      const opp = opposite[key];
      return {
        ...prev,
        [key]: [...prev[key], h].sort((a, b) => +a - +b),
        // Remove do grupo oposto para evitar conflito de grupo nos slots
        [opp]: prev[opp].filter((x: string) => x !== h),
      };
    });
    setNewHour((p) => ({ ...p, [key]: "" }));
  }

  function removeHour(key: "horarios_h1" | "horarios_h2" | "horarios_h1_sab" | "horarios_h2_sab", h: string) {
    setLocal((prev) => ({ ...prev, [key]: prev[key].filter((x: string) => x !== h) }));
  }

  function handleSave() {
    // Read from `local` state directly (not destructured vars) to guarantee latest
    const l = local;
    onSave({
      closers: l.closers, sdrs: l.sdrs, produtos: l.produtos, motivos: l.motivos,
      config_h1: l.config_h1, config_h2: l.config_h2,
      horarios_h1: l.horarios_h1, horarios_h2: l.horarios_h2,
      horarios_h1_sab: l.horarios_h1_sab, horarios_h2_sab: l.horarios_h2_sab,
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Save bar */}
      {changed && (
        <div className="sticky top-[57px] z-20 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span className="text-sm text-amber-700 flex-1">Você tem alterações não salvas.</span>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20"
          >
            Salvar Alterações
          </button>
        </div>
      )}

      {/* H1 / H2 groups */}
      {(["h1", "h2"] as const).map((grp) => {
        const cfg = grp === "h1" ? config_h1 : config_h2;
        const label = grp === "h1" ? "Horário 1" : "Horário 2";
        const hoursKey = grp === "h1" ? "horarios_h1" as const : "horarios_h2" as const;
        const hoursSabKey = grp === "h1" ? "horarios_h1_sab" as const : "horarios_h2_sab" as const;
        const hours = grp === "h1" ? horarios_h1 : horarios_h2;
        const hoursSab = grp === "h1" ? horarios_h1_sab : horarios_h2_sab;
        const gradient = grp === "h1" ? "from-blue-500 to-blue-600" : "from-indigo-500 to-indigo-600";

        return (
          <div key={grp} className="space-y-3">
            {/* Group header */}
            <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-4 shadow-sm`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white text-sm">
                  {grp.toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white">{label}</div>
                  <div className="text-white/70 text-xs">
                    {hours.map((h) => h + ":00").join(" · ")}
                  </div>
                </div>
              </div>
            </div>

            {/* Hours management - Weekday */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="font-bold text-sm text-slate-800">Horários — Seg a Sex</div>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 ml-auto">
                  {hours.length} horários
                </span>
              </div>
              <div className="text-xs text-slate-400 mb-3">Cada horário gera slots :00 (closers) e :10 (overbook).</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {hours.map((h) => (
                  <span
                    key={h}
                    className="group flex items-center gap-1.5 bg-gradient-to-b from-blue-50 to-blue-50/50 border border-blue-200/60 rounded-lg px-3 py-1.5 text-sm text-blue-700 font-bold tabular-nums transition-all hover:border-blue-300 hover:shadow-sm"
                  >
                    {h}:00
                    <button
                      onClick={() => removeHour(hoursKey, h)}
                      className="text-blue-300 text-sm leading-none hover:text-red-500 transition-colors rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-50"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={newHour[hoursKey] || ""}
                  onChange={(e) => setNewHour((p) => ({ ...p, [hoursKey]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") addHour(hoursKey); }}
                  placeholder="Ex: 19"
                  className="w-24 text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 tabular-nums transition-all"
                />
                <button
                  onClick={() => addHour(hoursKey)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20"
                >
                  + Horário
                </button>
              </div>
            </div>

            {/* Hours management - Saturday */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="font-bold text-sm text-slate-800">Horários — Sábado</div>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 ml-auto">
                  {hoursSab.length} horários
                </span>
              </div>
              <div className="text-xs text-slate-400 mb-3">Horários do sábado (geralmente reduzido).</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {hoursSab.length === 0 && <span className="text-xs text-slate-400 italic">Nenhum horário no sábado</span>}
                {hoursSab.map((h) => (
                  <span
                    key={h}
                    className="group flex items-center gap-1.5 bg-gradient-to-b from-amber-50 to-amber-50/50 border border-amber-200/60 rounded-lg px-3 py-1.5 text-sm text-amber-700 font-bold tabular-nums transition-all hover:border-amber-300 hover:shadow-sm"
                  >
                    {h}:00
                    <button
                      onClick={() => removeHour(hoursSabKey, h)}
                      className="text-amber-300 text-sm leading-none hover:text-red-500 transition-colors rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-50"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={newHour[hoursSabKey] || ""}
                  onChange={(e) => setNewHour((p) => ({ ...p, [hoursSabKey]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") addHour(hoursSabKey); }}
                  placeholder="Ex: 10"
                  className="w-24 text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 tabular-nums transition-all"
                />
                <button
                  onClick={() => addHour(hoursSabKey)}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 transition-all shadow-sm shadow-amber-600/20"
                >
                  + Horário
                </button>
              </div>
            </div>

            {/* Closers */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <div className="font-bold text-sm text-slate-800">Closers — {label}</div>
              </div>
              <div className="text-xs text-slate-400 mb-4">Slots :00 de cada horário.</div>
              <TagList
                items={cfg.closers}
                onRemove={(n) => {
                  setLocal((prev) => {
                    const cfgKey = grp === "h1" ? "config_h1" : "config_h2";
                    const oldCfg = prev[cfgKey];
                    return { ...prev, [cfgKey]: { ...oldCfg, closers: oldCfg.closers.filter((c) => c !== n) } };
                  });
                }}
                onAdd={(n) => {
                  setLocal((prev) => {
                    const cfgKey = grp === "h1" ? "config_h1" : "config_h2";
                    const oldCfg = prev[cfgKey];
                    if (oldCfg.closers.includes(n)) return prev;
                    const updated = { ...prev, [cfgKey]: { ...oldCfg, closers: [...oldCfg.closers, n] } };
                    if (!prev.closers.includes(n)) {
                      updated.closers = [...prev.closers, n];
                    }
                    return updated;
                  });
                }}
                placeholder="Nome do closer..."
              />
            </div>

            {/* Overbook */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                <div className="font-bold text-sm text-slate-800">Overbook — {label}</div>
              </div>
              <div className="text-xs text-slate-400 mb-4">Quantidade de linhas OB nos slots :10.</div>
              <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-3">
                <button
                  onClick={() => updCfg(grp, "overbook", Math.max(0, cfg.overbook - 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-lg font-bold hover:bg-slate-100 transition-all shadow-sm"
                >
                  −
                </button>
                <div className="text-center flex-1">
                  <span className="text-3xl font-bold text-blue-600 tabular-nums">{cfg.overbook}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    linha{cfg.overbook !== 1 ? "s" : ""} OB por horário
                  </div>
                </div>
                <button
                  onClick={() => updCfg(grp, "overbook", cfg.overbook + 1)}
                  className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-lg font-bold hover:bg-slate-100 transition-all shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Divider */}
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Listas globais</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Global lists */}
      {[
        { t: "SDRs", d: "Lista global de SDRs.", items: sdrs, key: "sdrs" as const, icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
        { t: "Produtos", d: "Produtos disponíveis.", items: produtos, key: "produtos" as const, icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },
        { t: "Motivos de cancelamento", d: "Usados ao excluir agendamentos.", items: motivos, key: "motivos" as const, icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" },
        { t: "Todos os closers", d: "Lista global para relatórios.", items: closers, key: "closers" as const, icon: "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" },
      ].map(({ t, d, items, key, icon }) => (
        <div key={t} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
            <div className="font-bold text-sm text-slate-800">{t}</div>
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 ml-auto">
              {items.length}
            </span>
          </div>
          <div className="text-xs text-slate-400 mb-4">{d}</div>
          <TagList
            items={items}
            onRemove={(n) => {
              setLocal((prev) => ({ ...prev, [key]: (prev[key] as string[]).filter((s) => s !== n) }));
            }}
            onAdd={(n) => {
              setLocal((prev) => {
                const list = prev[key] as string[];
                if (list.includes(n)) return prev;
                return { ...prev, [key]: [...list, n] };
              });
            }}
            placeholder="Adicionar..."
          />
        </div>
      ))}

      {/* Bottom save button */}
      {changed && (
        <div className="flex justify-center pb-4">
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Salvar Alterações
          </button>
        </div>
      )}
    </div>
  );
}

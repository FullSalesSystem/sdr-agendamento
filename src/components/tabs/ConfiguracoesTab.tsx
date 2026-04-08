"use client";

import TagList from "@/components/TagList";
import type { Settings, GroupConfig } from "@/lib/types";

interface Props {
  settings: Settings;
  onUpdate: (partial: Partial<Settings>) => void;
}

export default function ConfiguracoesTab({ settings, onUpdate }: Props) {
  const { closers, sdrs, produtos, motivos, config_h1, config_h2 } = settings;

  function updCfg(grp: "h1" | "h2", key: keyof GroupConfig, value: GroupConfig[keyof GroupConfig]) {
    const cfg = grp === "h1" ? { ...config_h1 } : { ...config_h2 };
    (cfg as Record<string, unknown>)[key] = value;
    onUpdate(grp === "h1" ? { config_h1: cfg } : { config_h2: cfg });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* H1 / H2 groups */}
      {(["h1", "h2"] as const).map((grp) => {
        const cfg = grp === "h1" ? config_h1 : config_h2;
        const label = grp === "h1" ? "Horario 1" : "Horario 2";
        const desc = grp === "h1" ? "10:00 · 13:00 · 15:00 · 17:00" : "11:00 · 14:00 · 16:00 · 18:00";
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
                  <div className="text-white/70 text-xs">{desc}</div>
                </div>
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
              <div className="text-xs text-slate-400 mb-4">Slots :00 de cada horario.</div>
              <TagList
                items={cfg.closers}
                onRemove={(n) => updCfg(grp, "closers", cfg.closers.filter((c) => c !== n))}
                onAdd={(n) => {
                  if (!cfg.closers.includes(n)) {
                    updCfg(grp, "closers", [...cfg.closers, n]);
                    if (!closers.includes(n)) onUpdate({ closers: [...closers, n] });
                  }
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
              <div className="text-xs text-slate-400 mb-4">Linhas OB nos slots :10.</div>
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
                    linha{cfg.overbook !== 1 ? "s" : ""} OB
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
        { t: "Produtos", d: "Produtos disponiveis.", items: produtos, key: "produtos" as const, icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },
        { t: "Motivos de cancelamento", d: "Usados ao excluir agendamentos.", items: motivos, key: "motivos" as const, icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" },
        { t: "Todos os closers", d: "Lista global para relatorios.", items: closers, key: "closers" as const, icon: "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" },
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
            onRemove={(n) => onUpdate({ [key]: items.filter((s) => s !== n) })}
            onAdd={(n) => {
              if (!items.includes(n)) onUpdate({ [key]: [...items, n] });
            }}
            placeholder="Adicionar..."
          />
        </div>
      ))}
    </div>
  );
}

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
    <div className="flex flex-col gap-3.5">
      {/* H1 / H2 toggle cards */}
      {(["h1", "h2"] as const).map((grp) => {
        const cfg = grp === "h1" ? config_h1 : config_h2;
        const label = grp === "h1" ? "Horário 1" : "Horário 2";
        const desc = grp === "h1" ? "10:00 · 13:00 · 15:00 · 17:00" : "11:00 · 14:00 · 16:00 · 18:00";

        return (
          <div key={grp} className="space-y-3">
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center font-bold text-sm text-blue-600">
                  {grp.toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm">{label}</div>
                  <div className="text-[11px] text-slate-400">{desc}</div>
                </div>
              </div>
            </div>

            {/* Closers for this group */}
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <div className="font-bold text-xs mb-1 uppercase tracking-wider">
                Closers — {label}
              </div>
              <div className="text-xs text-slate-400 mb-3">Slots :00 de cada horário.</div>
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

            {/* Overbook for this group */}
            <div className="bg-white rounded-xl border border-slate-100 p-4">
              <div className="font-bold text-xs mb-1 uppercase tracking-wider">
                Overbook — {label}
              </div>
              <div className="text-xs text-slate-400 mb-3">Linhas OB nos slots :10.</div>
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => updCfg(grp, "overbook", Math.max(0, cfg.overbook - 1))}
                  className="w-9 h-9 rounded-md border border-slate-200 bg-slate-50 text-xl font-bold hover:bg-slate-100"
                >
                  −
                </button>
                <span className="text-3xl font-bold text-blue-600 min-w-[36px] text-center">
                  {cfg.overbook}
                </span>
                <button
                  onClick={() => updCfg(grp, "overbook", cfg.overbook + 1)}
                  className="w-9 h-9 rounded-md border border-slate-200 bg-slate-50 text-xl font-bold hover:bg-slate-100"
                >
                  +
                </button>
                <span className="text-sm text-slate-400">
                  linha{cfg.overbook !== 1 ? "s" : ""} OB
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Global lists */}
      {[
        { t: "SDRs", d: "Lista global de SDRs.", items: sdrs, key: "sdrs" as const },
        { t: "Produtos", d: "Produtos disponíveis.", items: produtos, key: "produtos" as const },
        { t: "Motivos de cancelamento", d: "Usados ao excluir agendamentos.", items: motivos, key: "motivos" as const },
        { t: "Todos os closers", d: "Lista global para relatórios.", items: closers, key: "closers" as const },
      ].map(({ t, d, items, key }) => (
        <div key={t} className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="font-bold text-xs mb-1 uppercase tracking-wider">{t}</div>
          <div className="text-xs text-slate-400 mb-3">{d}</div>
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

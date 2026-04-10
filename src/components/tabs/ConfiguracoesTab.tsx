"use client";

import { useState, useEffect, useReducer } from "react";
import TagList from "@/components/TagList";
import type { Settings, GroupConfig } from "@/lib/types";

interface Props {
  settings: Settings;
  onUpdate: (partial: Partial<Settings>) => void;
}

// Use a reducer so every action computes from the latest state — no stale closures
type Action =
  | { type: "SET"; payload: Settings }
  | { type: "SET_CFG"; grp: "h1" | "h2"; key: keyof GroupConfig; value: GroupConfig[keyof GroupConfig] }
  | { type: "ADD_HOUR"; field: HourField; hour: string }
  | { type: "REMOVE_HOUR"; field: HourField; hour: string }
  | { type: "ADD_ITEM"; field: ListField; item: string }
  | { type: "REMOVE_ITEM"; field: ListField; item: string };

type HourField = "horarios_h1" | "horarios_h2" | "horarios_h1_sab" | "horarios_h2_sab";
type ListField = "closers" | "sdrs" | "produtos" | "motivos";

function reducer(state: Settings, action: Action): Settings {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "SET_CFG": {
      const cfgKey = action.grp === "h1" ? "config_h1" : "config_h2";
      const cfg = { ...state[cfgKey] };
      (cfg as Record<string, unknown>)[action.key] = action.value;
      return { ...state, [cfgKey]: cfg };
    }
    case "ADD_HOUR": {
      const current = state[action.field];
      if (current.includes(action.hour)) return state;
      return { ...state, [action.field]: [...current, action.hour].sort((a, b) => +a - +b) };
    }
    case "REMOVE_HOUR":
      return { ...state, [action.field]: state[action.field].filter((h) => h !== action.hour) };
    case "ADD_ITEM": {
      const list = state[action.field] as string[];
      if (list.includes(action.item)) return state;
      return { ...state, [action.field]: [...list, action.item] };
    }
    case "REMOVE_ITEM":
      return { ...state, [action.field]: (state[action.field] as string[]).filter((x) => x !== action.item) };
    default:
      return state;
  }
}

// Compute the partial that changed between old and new state
function diff(oldS: Settings, newS: Settings): Partial<Settings> | null {
  const partial: Record<string, unknown> = {};
  for (const k of Object.keys(newS) as (keyof Settings)[]) {
    if (k === "id" || k === "user_id") continue;
    if (JSON.stringify(oldS[k]) !== JSON.stringify(newS[k])) {
      partial[k] = newS[k];
    }
  }
  return Object.keys(partial).length > 0 ? partial : null;
}

export default function ConfiguracoesTab({ settings: parentSettings, onUpdate }: Props) {
  const [s, dispatch] = useReducer(reducer, parentSettings);
  const [newHour, setNewHour] = useState<Record<string, string>>({});

  // Sync from parent on initial load
  useEffect(() => {
    dispatch({ type: "SET", payload: parentSettings });
  }, [parentSettings.id]);

  // Helper: dispatch + persist
  function act(action: Action) {
    // Compute new state to get the diff
    const newState = reducer(s, action);
    if (newState === s) return; // no change
    dispatch(action);
    const changed = diff(s, newState);
    if (changed) onUpdate(changed);
  }

  const { closers, sdrs, produtos, motivos, config_h1, config_h2, horarios_h1, horarios_h2, horarios_h1_sab, horarios_h2_sab } = s;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {(["h1", "h2"] as const).map((grp) => {
        const cfg = grp === "h1" ? config_h1 : config_h2;
        const label = grp === "h1" ? "Horário 1" : "Horário 2";
        const hoursKey: HourField = grp === "h1" ? "horarios_h1" : "horarios_h2";
        const hoursSabKey: HourField = grp === "h1" ? "horarios_h1_sab" : "horarios_h2_sab";
        const hours = grp === "h1" ? horarios_h1 : horarios_h2;
        const hoursSab = grp === "h1" ? horarios_h1_sab : horarios_h2_sab;
        const gradient = grp === "h1" ? "from-blue-500 to-blue-600" : "from-indigo-500 to-indigo-600";

        return (
          <div key={grp} className="space-y-3">
            <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-4 shadow-sm`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white text-sm">{grp.toUpperCase()}</div>
                <div>
                  <div className="font-bold text-white">{label}</div>
                  <div className="text-white/70 text-xs">{hours.map((h) => h + ":00").join(" · ")}</div>
                </div>
              </div>
            </div>

            {/* Weekday hours */}
            <Card title="Horários — Seg a Sex" count={`${hours.length} horários`} icon="clock">
              <div className="flex flex-wrap gap-2 mb-3">
                {hours.map((h) => (
                  <HourTag key={h} hour={h} color="blue" onRemove={() => act({ type: "REMOVE_HOUR", field: hoursKey, hour: h })} />
                ))}
              </div>
              <HourInput
                value={newHour[hoursKey] || ""}
                onChange={(v) => setNewHour((p) => ({ ...p, [hoursKey]: v }))}
                onAdd={() => {
                  const val = (newHour[hoursKey] || "").trim();
                  const n = parseInt(val);
                  if (!isNaN(n) && n >= 0 && n <= 23) {
                    act({ type: "ADD_HOUR", field: hoursKey, hour: String(n) });
                    setNewHour((p) => ({ ...p, [hoursKey]: "" }));
                  }
                }}
                color="blue"
              />
            </Card>

            {/* Saturday hours */}
            <Card title="Horários — Sábado" count={`${hoursSab.length} horários`} icon="clock">
              <div className="flex flex-wrap gap-2 mb-3">
                {hoursSab.length === 0 && <span className="text-xs text-slate-400 italic">Nenhum horário no sábado</span>}
                {hoursSab.map((h) => (
                  <HourTag key={h} hour={h} color="amber" onRemove={() => act({ type: "REMOVE_HOUR", field: hoursSabKey, hour: h })} />
                ))}
              </div>
              <HourInput
                value={newHour[hoursSabKey] || ""}
                onChange={(v) => setNewHour((p) => ({ ...p, [hoursSabKey]: v }))}
                onAdd={() => {
                  const val = (newHour[hoursSabKey] || "").trim();
                  const n = parseInt(val);
                  if (!isNaN(n) && n >= 0 && n <= 23) {
                    act({ type: "ADD_HOUR", field: hoursSabKey, hour: String(n) });
                    setNewHour((p) => ({ ...p, [hoursSabKey]: "" }));
                  }
                }}
                color="amber"
              />
            </Card>

            {/* Closers */}
            <Card title={`Closers — ${label}`} icon="users" subtitle="Slots :00 de cada horário.">
              <TagList
                items={cfg.closers}
                onRemove={(n) => act({ type: "SET_CFG", grp, key: "closers", value: cfg.closers.filter((c) => c !== n) })}
                onAdd={(n) => {
                  if (!cfg.closers.includes(n)) {
                    act({ type: "SET_CFG", grp, key: "closers", value: [...cfg.closers, n] });
                    if (!closers.includes(n)) act({ type: "ADD_ITEM", field: "closers", item: n });
                  }
                }}
                placeholder="Nome do closer..."
              />
            </Card>

            {/* Overbook */}
            <Card title={`Overbook — ${label}`} icon="lines" subtitle="Quantidade de linhas OB nos slots :10.">
              <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-3">
                <button onClick={() => act({ type: "SET_CFG", grp, key: "overbook", value: Math.max(0, cfg.overbook - 1) })} className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-lg font-bold hover:bg-slate-100 transition-all shadow-sm">−</button>
                <div className="text-center flex-1">
                  <span className="text-3xl font-bold text-blue-600 tabular-nums">{cfg.overbook}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">linha{cfg.overbook !== 1 ? "s" : ""} OB por horário</div>
                </div>
                <button onClick={() => act({ type: "SET_CFG", grp, key: "overbook", value: cfg.overbook + 1 })} className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-lg font-bold hover:bg-slate-100 transition-all shadow-sm">+</button>
              </div>
            </Card>
          </div>
        );
      })}

      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Listas globais</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {([
        { t: "SDRs", d: "Lista global de SDRs.", items: sdrs, key: "sdrs" as ListField },
        { t: "Produtos", d: "Produtos disponíveis.", items: produtos, key: "produtos" as ListField },
        { t: "Motivos de cancelamento", d: "Usados ao excluir agendamentos.", items: motivos, key: "motivos" as ListField },
        { t: "Todos os closers", d: "Lista global para relatórios.", items: closers, key: "closers" as ListField },
      ]).map(({ t, d, items, key }) => (
        <Card key={t} title={t} icon="list" subtitle={d} count={String(items.length)}>
          <TagList
            items={items}
            onRemove={(n) => act({ type: "REMOVE_ITEM", field: key, item: n })}
            onAdd={(n) => act({ type: "ADD_ITEM", field: key, item: n })}
            placeholder="Adicionar..."
          />
        </Card>
      ))}
    </div>
  );
}

// ── Sub-components ──

const ICONS: Record<string, string> = {
  clock: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  users: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  lines: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
  list: "M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
};

function Card({ title, subtitle, icon, count, children }: { title: string; subtitle?: string; icon: string; count?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[icon] || ICONS.list} />
        </svg>
        <div className="font-bold text-sm text-slate-800">{title}</div>
        {count && <span className="text-[10px] font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 ml-auto">{count}</span>}
      </div>
      {subtitle && <div className="text-xs text-slate-400 mb-4">{subtitle}</div>}
      {!subtitle && <div className="mb-3" />}
      {children}
    </div>
  );
}

function HourTag({ hour, color, onRemove }: { hour: string; color: "blue" | "amber"; onRemove: () => void }) {
  const bg = color === "blue" ? "from-blue-50 to-blue-50/50 border-blue-200/60 text-blue-700" : "from-amber-50 to-amber-50/50 border-amber-200/60 text-amber-700";
  return (
    <span className={`flex items-center gap-1.5 bg-gradient-to-b ${bg} border rounded-lg px-3 py-1.5 text-sm font-bold tabular-nums`}>
      {hour}:00
      <button onClick={onRemove} className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-md w-6 h-6 flex items-center justify-center text-lg leading-none">×</button>
    </span>
  );
}

function HourInput({ value, onChange, onAdd, color }: { value: string; onChange: (v: string) => void; onAdd: () => void; color: "blue" | "amber" }) {
  const btnClass = color === "blue"
    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
    : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20";
  return (
    <div className="flex gap-2">
      <input type="number" min={0} max={23} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onAdd(); }} placeholder={color === "blue" ? "Ex: 19" : "Ex: 10"} className="w-24 text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 tabular-nums transition-all" />
      <button onClick={onAdd} className={`px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-sm ${btnClass}`}>+ Horário</button>
    </div>
  );
}

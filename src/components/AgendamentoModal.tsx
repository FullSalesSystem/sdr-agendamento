"use client";

import { useState, useEffect } from "react";
import type { AgendamentoForm } from "@/lib/types";
import { orderedHours } from "@/lib/utils";
import { STATUS_LIST } from "@/lib/constants";

interface Props {
  date: Date;
  mode: "add" | "edit";
  initial: AgendamentoForm;
  closers: string[];
  produtos: string[];
  sdrs: string[];
  motivos: string[];
  onSave: (form: AgendamentoForm) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function AgendamentoModal({
  date, mode, initial, closers, produtos, sdrs, motivos, onSave, onDelete, onClose,
}: Props) {
  const [form, setForm] = useState<AgendamentoForm>(initial);
  const hours = orderedHours(date);

  useEffect(() => { setForm(initial); }, [initial]);

  const upd = (key: keyof AgendamentoForm, val: string) =>
    setForm((f) => ({ ...f, [key]: val, ...(key === "status" ? { motivo: "" } : {}) }));

  function handleSave() {
    if (!form.closer || !form.produto) return;
    onSave(form);
  }

  const dateLabel = date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-bold text-base mb-1">
          {mode === "add" ? "Novo agendamento" : "Editar agendamento"}
        </h2>
        <p className="text-xs text-slate-500 mb-5 capitalize">{dateLabel}</p>

        <Field label="Horário">
          <select value={form.horario} onChange={(e) => upd("horario", e.target.value)} className="input-field">
            {hours.map((h) => <option key={h}>{h}</option>)}
          </select>
        </Field>

        <Field label="Closer">
          <select value={form.closer} onChange={(e) => upd("closer", e.target.value)} className="input-field">
            <option value="">Selecionar...</option>
            {closers.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Produto">
          <select value={form.produto} onChange={(e) => upd("produto", e.target.value)} className="input-field">
            <option value="">Selecionar...</option>
            {produtos.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>

        <Field label="SDR">
          <select value={form.sdr} onChange={(e) => upd("sdr", e.target.value)} className="input-field">
            <option value="">Nenhum</option>
            {sdrs.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>

        <Field label="Status">
          <select value={form.status} onChange={(e) => upd("status", e.target.value)} className="input-field">
            {STATUS_LIST.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>

        {(form.status === "Reagendamento" || form.status === "Bloqueado") && (
          <Field label="Motivo">
            <select value={form.motivo} onChange={(e) => upd("motivo", e.target.value)} className="input-field">
              <option value="">Selecionar...</option>
              {motivos.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
        )}

        <Field label="Obs.">
          <input
            value={form.obs}
            onChange={(e) => upd("obs", e.target.value)}
            placeholder="Observações..."
            className="input-field"
          />
        </Field>

        <div className="flex gap-2 mt-5">
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors">
            Salvar
          </button>
          {mode === "edit" && onDelete && (
            <button onClick={onDelete} className="py-2.5 px-4 rounded-lg border border-red-200 bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors">
              Excluir
            </button>
          )}
          <button onClick={onClose} className="py-2.5 px-4 rounded-lg border border-slate-200 text-slate-500 font-semibold text-sm hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

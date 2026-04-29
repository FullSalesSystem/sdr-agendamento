"use client";

import { useState, useEffect } from "react";
import type { AgendamentoForm } from "@/lib/types";
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

  useEffect(() => { setForm(initial); }, [initial]);

  const upd = (key: keyof AgendamentoForm, val: string) =>
    setForm((f) => ({ ...f, [key]: val, ...(key === "status" ? { motivo: "" } : {}) }));

  function handleSave() {
    if (!form.closer || !form.produto) return;
    onSave(form);
  }

  const dateLabel = date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  const isValid = form.closer && form.produto;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              {mode === "add" ? "Novo agendamento" : "Editar agendamento"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">{dateLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3.5">
          <Field label="Horário">
            <div className="input-field bg-slate-50 text-slate-500 cursor-not-allowed select-none">
              {form.horario}
            </div>
          </Field>

          <Field label="Closer" required>
            <select value={form.closer} onChange={(e) => upd("closer", e.target.value)} className={`input-field ${!form.closer ? "text-slate-400" : ""}`}>
              <option value="">Selecionar...</option>
              {closers.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Produto" required>
            <select value={form.produto} onChange={(e) => upd("produto", e.target.value)} className={`input-field ${!form.produto ? "text-slate-400" : ""}`}>
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

          <Field label="Observações">
            <input
              value={form.obs}
              onChange={(e) => upd("obs", e.target.value)}
              placeholder="Adicionar observação..."
              className="input-field"
            />
          </Field>
        </div>

        <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-blue-600/20"
          >
            Salvar
          </button>
          {mode === "edit" && onDelete && (
            <button
              onClick={onDelete}
              className="py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
            >
              Excluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

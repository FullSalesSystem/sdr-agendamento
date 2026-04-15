"use client";

import { useState, useMemo, useCallback } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { useToast } from "@/components/Toast";
import { MESES, TABS, ACTIVE_STATUSES } from "@/lib/constants";
import type { TabName } from "@/lib/constants";
import type { Agendamento, AgendamentoForm, Settings } from "@/lib/types";
import { orderedHours } from "@/lib/utils";
import AgendamentoModal from "@/components/AgendamentoModal";
import DeleteModal from "@/components/DeleteModal";
import AgendamentoTab from "@/components/tabs/AgendamentoTab";
import RelatorioTab from "@/components/tabs/RelatorioTab";
import SDRsTab from "@/components/tabs/SDRsTab";
import PorCloserTab from "@/components/tabs/PorCloserTab";
import CancelamentosTab from "@/components/tabs/CancelamentosTab";
import ConfiguracoesTab from "@/components/tabs/ConfiguracoesTab";

const TAB_ICONS: Record<TabName, string> = {
  Agendamento: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  Relatório: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  SDRs: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  "Por Closer": "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z",
  Cancelamentos: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  Configurações: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
};

const emptyForm = (): AgendamentoForm => ({
  horario: "",
  closer: "",
  produto: "",
  sdr: "",
  status: "Livre",
  motivo: "",
  obs: "",
});

const CONFIG_PIN = "30218";
const SESSION_KEY = "config_unlocked";

function SaveConfirmModal({ onConfirm, onClose }: { onConfirm: (from: "today" | "tomorrow") => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-96 flex flex-col gap-4">
        <div>
          <div className="font-bold text-slate-800 text-base">Aplicar alterações</div>
          <div className="text-sm text-slate-500 mt-1">
            Agendamentos já preenchidos não serão alterados. Dias anteriores não serão afetados.
            <br />A partir de quando as novas configurações devem valer?
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onConfirm("today")}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all"
          >
            A partir de hoje
          </button>
          <button
            onClick={() => onConfirm("tomorrow")}
            className="w-full py-3 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-sm hover:bg-indigo-100 transition-all"
          >
            A partir de amanhã
          </button>
        </div>
        <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600 transition-colors text-center">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function PinModal({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === CONFIG_PIN) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onSuccess();
    } else {
      setError(true);
      setPin("");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-slate-800">Área restrita</div>
            <div className="text-xs text-slate-400">Digite o PIN para acessar</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(false); }}
            placeholder="PIN"
            className={`w-full text-center text-xl tracking-widest border rounded-xl px-4 py-3 outline-none transition-all ${error ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300" : "border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"}`}
          />
          {error && <p className="text-xs text-red-500 text-center">PIN incorreto. Tente novamente.</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm">
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const now = new Date();
  const [tab, setTab] = useState<TabName>("Agendamento");
  const [showPinModal, setShowPinModal] = useState(false);
  const [selM, setSelM] = useState(now.getMonth());
  const [selY, setSelY] = useState(now.getFullYear());
  const [wDate, setWDate] = useState(now);
  const { toast } = useToast();

  const { settings, loading: sLoading, update: updateSettings } = useSettings();
  const { agendamentos, loading: aLoading, upsert, cancel, remove } = useAgendamentos();

  const [modal, setModal] = useState<{ mode: "add" | "edit"; date: Date; agId?: string } | null>(null);
  const [form, setForm] = useState<AgendamentoForm>(emptyForm());
  const [delModal, setDelModal] = useState<{ agId: string; grace: boolean } | null>(null);
  const [pendingConfig, setPendingConfig] = useState<Partial<Omit<Settings, "id" | "user_id">> | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Filter: exclude canceled from month metrics
  const monthAgs = useMemo(() => {
    return agendamentos.filter((a) => {
      const d = new Date(a.date + "T00:00:00");
      return d.getMonth() === selM && d.getFullYear() === selY;
    });
  }, [agendamentos, selM, selY]);

  const monthAgsActive = useMemo(() => monthAgs.filter((a) => !a.cancelado), [monthAgs]);

  const totalMonth = monthAgsActive.filter((a) => ACTIVE_STATUSES.includes(a.status)).length;

  const selWeek = useCallback((d: Date) => {
    setWDate(d);
    setSelM(d.getMonth());
    setSelY(d.getFullYear());
  }, []);

  function openAdd(date: Date, hour?: string) {
    setForm({ ...emptyForm(), horario: hour || orderedHours(date, settings)[0] });
    setModal({ mode: "add", date });
  }

  function openEdit(date: Date, ag: Agendamento) {
    setForm({
      horario: ag.horario,
      closer: ag.closer,
      produto: ag.produto,
      sdr: ag.sdr,
      status: ag.status,
      motivo: ag.motivo,
      obs: ag.obs,
    });
    setModal({ mode: "edit", date, agId: ag.id });
  }

  async function handleSave(f: AgendamentoForm) {
    if (!modal) return;
    try {
      await upsert(modal.date, f, modal.agId);
      setModal(null);
      toast(modal.agId ? "Agendamento atualizado" : "Agendamento criado");
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : String(err);
      if (detail.includes("23505") || detail.includes("unique")) {
        toast("Slot já ocupado — este horário/closer já tem agendamento.", "error");
      } else if (detail.includes("RLS") || detail.includes("PGRST") || detail.includes("42501")) {
        toast("Sem permissão — desative o RLS no Supabase: ALTER TABLE public.agendamentos DISABLE ROW LEVEL SECURITY;", "error");
      } else {
        toast("Erro ao salvar agendamento", "error");
      }
      console.error("[handleSave] erro:", detail);
    }
  }

  function handleDeleteClick() {
    if (!modal?.agId) return;
    const ag = agendamentos.find((a) => a.id === modal.agId);
    const grace = ag ? Date.now() - new Date(ag.created_at).getTime() <= 30 * 60 * 1000 : false;
    setDelModal({ agId: modal.agId, grace });
  }

  async function handleCancel(motivo: string) {
    if (!delModal) return;
    try {
      await cancel(delModal.agId, motivo);
      setDelModal(null);
      setModal(null);
      toast("Agendamento cancelado");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "RLS_BLOCKED") {
        toast("Cancelamento não salvo no banco — desative o RLS no Supabase SQL Editor: ALTER TABLE public.agendamentos DISABLE ROW LEVEL SECURITY;", "error");
      } else {
        toast("Erro ao cancelar agendamento", "error");
      }
    }
  }

  async function handleRemove() {
    if (!delModal) return;
    try {
      await remove(delModal.agId);
      setDelModal(null);
      setModal(null);
      toast("Agendamento excluído");
    } catch {
      toast("Erro ao excluir agendamento", "error");
    }
  }

  function handleConfigSave(newCfg: Partial<Omit<Settings, "id" | "user_id">>) {
    setPendingConfig(newCfg);
    setShowSaveModal(true);
  }

  async function handleConfirmSave(_from: "today" | "tomorrow") {
    if (!pendingConfig) return;
    setShowSaveModal(false);
    setPendingConfig(null);
    try {
      await updateSettings(pendingConfig);
      toast("Configurações salvas");
    } catch {
      toast("Erro ao salvar — verifique o console e desative o RLS no Supabase.", "error");
    }
  }

  const years = [now.getFullYear(), now.getFullYear() + 1];

  if (sLoading || aLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-[3px] border-blue-200 border-t-blue-600 rounded-full animate-spin-slow" />
        <div className="text-slate-400 text-sm font-medium">Carregando agenda...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen font-sans text-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4 shadow-lg shadow-blue-900/10">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white text-lg shadow-inner shrink-0">
          S
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-base tracking-tight">SDR Agendamento</div>
          <div className="text-blue-200 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot shrink-0" />
            <span className="truncate">{totalMonth} agendamento{totalMonth !== 1 ? "s" : ""} em {MESES[selM]}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selM}
            onChange={(e) => {
              const m = +e.target.value;
              setSelM(m);
              selWeek(new Date(selY, m, 1));
            }}
            className="text-sm rounded-lg px-2 sm:px-3 py-2 bg-white/15 backdrop-blur-sm text-white outline-none border border-white/10 hover:bg-white/25 transition-colors cursor-pointer [&>option]:text-slate-900 [&>option]:bg-white"
          >
            {MESES.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={selY}
            onChange={(e) => {
              const y = +e.target.value;
              setSelY(y);
              selWeek(new Date(y, selM, 1));
            }}
            className="text-sm rounded-lg px-2 sm:px-3 py-2 bg-white/15 backdrop-blur-sm text-white outline-none border border-white/10 hover:bg-white/25 transition-colors cursor-pointer [&>option]:text-slate-900 [&>option]:bg-white"
          >
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 flex overflow-x-auto sticky top-0 z-30 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              if (t === "Configurações" && !sessionStorage.getItem(SESSION_KEY)) {
                setShowPinModal(true);
              } else {
                setTab(t);
              }
            }}
            className={`group flex items-center gap-2 px-3 sm:px-4 py-3.5 text-sm whitespace-nowrap border-b-2 transition-all duration-200 ${
              tab === t
                ? "font-semibold text-blue-600 border-blue-600 bg-blue-50/50"
                : "font-medium text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50/50"
            }`}
          >
            <svg
              className={`w-4 h-4 transition-colors shrink-0 ${tab === t ? "text-blue-500" : "text-slate-300 group-hover:text-slate-400"}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={TAB_ICONS[t]} />
            </svg>
            <span className="hidden sm:inline">{t}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 lg:p-6 animate-fade-in" key={tab}>
        {tab === "Agendamento" && (
          <AgendamentoTab
            selM={selM}
            selY={selY}
            wDate={wDate}
            agendamentos={agendamentos}
            closers={settings.closers}
            produtos={settings.produtos}
            configH1={settings.config_h1}
            configH2={settings.config_h2}
            hoursConfig={settings}
            onSelectWeek={selWeek}
            onOpenAdd={openAdd}
            onOpenEdit={openEdit}
          />
        )}

        {tab === "Relatório" && (
          <RelatorioTab agendamentos={monthAgsActive} produtos={settings.produtos} selM={selM} />
        )}

        {tab === "SDRs" && (
          <SDRsTab agendamentos={monthAgsActive} sdrs={settings.sdrs} selM={selM} />
        )}

        {tab === "Por Closer" && (
          <PorCloserTab agendamentos={monthAgs} closers={settings.closers} selM={selM} />
        )}

        {tab === "Cancelamentos" && (
          <CancelamentosTab agendamentos={monthAgs} motivos={settings.motivos} selM={selM} />
        )}

        {tab === "Configurações" && (
          <ConfiguracoesTab settings={settings} onSave={handleConfigSave} />
        )}
      </div>

      {/* Save Confirm Modal */}
      {showSaveModal && (
        <SaveConfirmModal
          onConfirm={handleConfirmSave}
          onClose={() => { setShowSaveModal(false); setPendingConfig(null); }}
        />
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <PinModal
          onSuccess={() => { setShowPinModal(false); setTab("Configurações"); }}
          onClose={() => setShowPinModal(false)}
        />
      )}

      {/* Agendamento Modal */}
      {modal && (
        <AgendamentoModal
          date={modal.date}
          mode={modal.mode}
          initial={form}
          closers={settings.closers}
          produtos={settings.produtos}
          sdrs={settings.sdrs}
          motivos={settings.motivos}
          hoursConfig={settings}
          onSave={handleSave}
          onDelete={modal.mode === "edit" ? handleDeleteClick : undefined}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete Modal */}
      {delModal && (
        <DeleteModal
          motivos={settings.motivos}
          showGrace={delModal.grace}
          onCancel={handleCancel}
          onRemove={handleRemove}
          onClose={() => setDelModal(null)}
        />
      )}
    </div>
  );
}

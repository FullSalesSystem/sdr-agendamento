"use client";

import { useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSettings } from "@/hooks/useSettings";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { MESES, TABS } from "@/lib/constants";
import type { TabName } from "@/lib/constants";
import type { Agendamento, AgendamentoForm } from "@/lib/types";
import { orderedHours, fmtDate } from "@/lib/utils";
import AgendamentoModal from "@/components/AgendamentoModal";
import DeleteModal from "@/components/DeleteModal";
import AgendamentoTab from "@/components/tabs/AgendamentoTab";
import RelatorioTab from "@/components/tabs/RelatorioTab";
import SDRsTab from "@/components/tabs/SDRsTab";
import PorCloserTab from "@/components/tabs/PorCloserTab";
import CancelamentosTab from "@/components/tabs/CancelamentosTab";
import ConfiguracoesTab from "@/components/tabs/ConfiguracoesTab";

const emptyForm = (): AgendamentoForm => ({
  horario: "",
  closer: "",
  produto: "",
  sdr: "",
  status: "Livre",
  motivo: "",
  obs: "",
});

export default function DashboardPage() {
  const now = new Date();
  const [tab, setTab] = useState<TabName>("Agendamento");
  const [selM, setSelM] = useState(now.getMonth());
  const [selY, setSelY] = useState(now.getFullYear());
  const [wDate, setWDate] = useState(now);

  const { settings, loading: sLoading, update: updateSettings } = useSettings();
  const { agendamentos, loading: aLoading, upsert, cancel, remove } = useAgendamentos();

  // Modal state
  const [modal, setModal] = useState<{ mode: "add" | "edit"; date: Date; agId?: string } | null>(null);
  const [form, setForm] = useState<AgendamentoForm>(emptyForm());
  const [delModal, setDelModal] = useState<{ agId: string; grace: boolean } | null>(null);

  // Filter agendamentos by selected month
  const monthAgs = useMemo(() => {
    return agendamentos.filter((a) => {
      const d = new Date(a.date + "T00:00:00");
      return d.getMonth() === selM && d.getFullYear() === selY;
    });
  }, [agendamentos, selM, selY]);

  const selWeek = useCallback((d: Date) => {
    setWDate(d);
    setSelM(d.getMonth());
    setSelY(d.getFullYear());
  }, []);

  function openAdd(date: Date, hour?: string) {
    setForm({ ...emptyForm(), horario: hour || orderedHours(date)[0] });
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
    await upsert(modal.date, f, modal.agId);
    setModal(null);
  }

  function handleDeleteClick() {
    if (!modal?.agId) return;
    const ag = agendamentos.find((a) => a.id === modal.agId);
    const grace = ag ? Date.now() - new Date(ag.created_at).getTime() <= 30 * 60 * 1000 : false;
    setDelModal({ agId: modal.agId, grace });
  }

  async function handleCancel(motivo: string) {
    if (!delModal) return;
    await cancel(delModal.agId, motivo);
    setDelModal(null);
    setModal(null);
  }

  async function handleRemove() {
    if (!delModal) return;
    await remove(delModal.agId);
    setDelModal(null);
    setModal(null);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const years = [now.getFullYear(), now.getFullYear() + 1];

  if (sLoading || aLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm font-medium">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* Header */}
      <div className="bg-blue-700 px-5 py-3.5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center font-bold text-white text-base">
          S
        </div>
        <div>
          <div className="text-white font-bold text-sm">SDR Agendamento</div>
          <div className="text-white/60 text-[11px]">{MESES[selM]} {selY}</div>
        </div>
        <div className="flex-1" />
        <select
          value={selM}
          onChange={(e) => {
            const m = +e.target.value;
            setSelM(m);
            selWeek(new Date(selY, m, 1));
          }}
          className="text-sm border-none rounded-md px-2.5 py-1.5 bg-white/15 text-white outline-none [&>option]:text-slate-900 [&>option]:bg-white"
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
          className="text-sm border-none rounded-md px-2.5 py-1.5 bg-white/15 text-white outline-none [&>option]:text-slate-900 [&>option]:bg-white"
        >
          {years.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
        <button
          onClick={handleLogout}
          className="text-white/60 hover:text-white text-xs font-medium ml-2 transition-colors"
        >
          Sair
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 flex overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
              tab === t
                ? "font-bold text-blue-600 border-blue-600"
                : "font-normal text-slate-500 border-transparent hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
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
            onSelectWeek={selWeek}
            onOpenAdd={openAdd}
            onOpenEdit={openEdit}
          />
        )}

        {tab === "Relatório" && (
          <RelatorioTab agendamentos={monthAgs} produtos={settings.produtos} selM={selM} />
        )}

        {tab === "SDRs" && (
          <SDRsTab agendamentos={monthAgs} sdrs={settings.sdrs} selM={selM} />
        )}

        {tab === "Por Closer" && (
          <PorCloserTab agendamentos={monthAgs} closers={settings.closers} selM={selM} />
        )}

        {tab === "Cancelamentos" && (
          <CancelamentosTab agendamentos={monthAgs} motivos={settings.motivos} selM={selM} />
        )}

        {tab === "Configurações" && (
          <ConfiguracoesTab settings={settings} onUpdate={updateSettings} />
        )}
      </div>

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

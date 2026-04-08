"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Agendamento, AgendamentoForm } from "@/lib/types";
import { fmtDate } from "@/lib/utils";

export function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (data) setAgendamentos(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const upsert = useCallback(async (date: Date, form: AgendamentoForm, existingId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      date: fmtDate(date),
      horario: form.horario,
      closer: form.closer,
      produto: form.produto,
      sdr: form.sdr,
      status: form.status,
      motivo: form.motivo,
      obs: form.obs,
      cancelado: false,
      cancel_motivo: null,
      updated_at: new Date().toISOString(),
    };

    if (existingId) {
      const { data } = await supabase
        .from("agendamentos")
        .update(payload)
        .eq("id", existingId)
        .select()
        .single();
      if (data) {
        setAgendamentos((prev) => prev.map((a) => (a.id === existingId ? data : a)));
      }
    } else {
      const { data } = await supabase
        .from("agendamentos")
        .insert(payload)
        .select()
        .single();
      if (data) {
        setAgendamentos((prev) => [...prev, data]);
      }
    }
  }, [supabase]);

  const cancel = useCallback(async (id: string, motivo: string) => {
    const { data } = await supabase
      .from("agendamentos")
      .update({
        cancelado: true,
        cancel_motivo: motivo,
        closer: "",
        produto: "",
        sdr: "",
        status: "Livre",
        motivo: "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (data) {
      setAgendamentos((prev) => prev.map((a) => (a.id === id ? data : a)));
    }
  }, [supabase]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("agendamentos").delete().eq("id", id);
    setAgendamentos((prev) => prev.filter((a) => a.id !== id));
  }, [supabase]);

  return { agendamentos, loading, upsert, cancel, remove, reload: load };
}

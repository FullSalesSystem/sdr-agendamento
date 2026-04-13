"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Agendamento, AgendamentoForm } from "@/lib/types";
import { fmtDate } from "@/lib/utils";
import { SHARED_USER_ID } from "@/lib/constants";

export function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("user_id", SHARED_USER_ID)
        .order("date", { ascending: true });

      if (error) throw error;
      if (data) setAgendamentos(data);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const upsert = useCallback(async (date: Date, form: AgendamentoForm, existingId?: string) => {
    const payload = {
      user_id: SHARED_USER_ID,
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

    try {
      if (existingId) {
        const { data, error } = await supabase
          .from("agendamentos")
          .update(payload)
          .eq("id", existingId)
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setAgendamentos((prev) => prev.map((a) => (a.id === existingId ? data : a)));
        }
      } else {
        const { data, error } = await supabase
          .from("agendamentos")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setAgendamentos((prev) => [...prev, data]);
        }
      }
    } catch (err) {
      console.error("Erro ao salvar agendamento:", err);
      throw err;
    }
  }, [supabase]);

  // Cancel preserves closer/produto/sdr for metrics history
  const cancel = useCallback(async (id: string, motivo: string) => {
    // Optimistic update so UI reflects immediately
    setAgendamentos((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, cancelado: true, cancel_motivo: motivo, status: "Livre" } : a
      )
    );
    try {
      const { data, error } = await supabase
        .from("agendamentos")
        .update({
          cancelado: true,
          cancel_motivo: motivo,
          status: "Livre",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        // Revert optimistic update
        setAgendamentos((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, cancelado: false, cancel_motivo: null, status: "Agendamento" } : a
          )
        );
        console.error("[RLS] Cancelamento bloqueado — execute no Supabase SQL Editor:\nALTER TABLE public.agendamentos DISABLE ROW LEVEL SECURITY;");
        throw new Error("RLS_BLOCKED");
      }
      if (data) {
        setAgendamentos((prev) => prev.map((a) => (a.id === id ? data : a)));
      }
    } catch (err) {
      console.error("Erro ao cancelar agendamento:", err);
      throw err;
    }
  }, [supabase]);

  const remove = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("agendamentos").delete().eq("id", id);
      if (error) throw error;
      setAgendamentos((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Erro ao excluir agendamento:", err);
      throw err;
    }
  }, [supabase]);

  return { agendamentos, loading, upsert, cancel, remove, reload: load };
}

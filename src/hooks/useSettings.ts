"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Settings, GroupConfig } from "@/lib/types";
import {
  DEFAULT_CLOSERS, DEFAULT_SDRS, DEFAULT_PRODUTOS, DEFAULT_MOTIVOS,
  DEFAULT_CONFIG_H1, DEFAULT_CONFIG_H2, DEFAULT_H1, DEFAULT_H2,
  DEFAULT_H1_SAB, DEFAULT_H2_SAB, SHARED_USER_ID,
} from "@/lib/constants";

const defaults: Omit<Settings, "id" | "user_id"> = {
  closers: DEFAULT_CLOSERS,
  sdrs: DEFAULT_SDRS,
  produtos: DEFAULT_PRODUTOS,
  motivos: DEFAULT_MOTIVOS,
  config_h1: DEFAULT_CONFIG_H1,
  config_h2: DEFAULT_CONFIG_H2,
  horarios_h1: DEFAULT_H1,
  horarios_h2: DEFAULT_H2,
  horarios_h1_sab: DEFAULT_H1_SAB,
  horarios_h2_sab: DEFAULT_H2_SAB,
};

function normalise(data: Record<string, unknown>): Settings {
  const rawH1 = data.config_h1 as GroupConfig | null;
  const rawH2 = data.config_h2 as GroupConfig | null;
  return {
    ...data,
    // Guard against NULL in DB (column added after row creation)
    config_h1: rawH1 && Array.isArray(rawH1.closers) ? rawH1 : DEFAULT_CONFIG_H1,
    config_h2: rawH2 && Array.isArray(rawH2.closers) ? rawH2 : DEFAULT_CONFIG_H2,
    horarios_h1: (data.horarios_h1 as string[] | null) ?? DEFAULT_H1,
    horarios_h2: (data.horarios_h2 as string[] | null) ?? DEFAULT_H2,
    horarios_h1_sab: (data.horarios_h1_sab as string[] | null) ?? DEFAULT_H1_SAB,
    horarios_h2_sab: (data.horarios_h2_sab as string[] | null) ?? DEFAULT_H2_SAB,
  } as Settings;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const idRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = supabaseRef.current;

    async function load() {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("user_id", SHARED_USER_ID)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("[useSettings] Erro ao carregar:", error.message, "— Verifique se o RLS está desativado na tabela settings.");
          setLoading(false);
          return;
        }

        if (data) {
          idRef.current = data.id;
          setSettings(normalise(data));
        } else {
          // Row doesn't exist yet — create it
          const { data: created, error: insertErr } = await supabase
            .from("settings")
            .insert({ user_id: SHARED_USER_ID })
            .select()
            .single();

          if (insertErr) {
            console.error("[useSettings] Erro ao criar settings:", insertErr.message, "— Verifique se o RLS está desativado.");
            setLoading(false);
            return;
          }

          if (created) {
            idRef.current = created.id;
            setSettings(normalise(created));
          }
        }
      } catch (err) {
        console.error("[useSettings] Erro inesperado:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const update = useCallback(async (partial: Partial<Omit<Settings, "id" | "user_id">>) => {
    // Optimistic update immediately
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, ...partial };
    });

    const id = idRef.current;
    if (!id) {
      console.error("[useSettings] update chamado antes do carregamento completo ou RLS está bloqueando o acesso.");
      return;
    }

    const { error } = await supabaseRef.current
      .from("settings")
      .update(partial)
      .eq("id", id);

    if (error) {
      console.error("[useSettings] Erro ao salvar no banco:", error.message);
      throw error; // re-throw so caller can show a toast
    }
  }, []);

  return { settings: settings ?? (defaults as Settings), loading, update };
}

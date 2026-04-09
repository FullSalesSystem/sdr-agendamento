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

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("user_id", SHARED_USER_ID)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setSettings({
            ...data,
            config_h1: data.config_h1 as GroupConfig,
            config_h2: data.config_h2 as GroupConfig,
            horarios_h1: data.horarios_h1 ?? DEFAULT_H1,
            horarios_h2: data.horarios_h2 ?? DEFAULT_H2,
            horarios_h1_sab: data.horarios_h1_sab ?? DEFAULT_H1_SAB,
            horarios_h2_sab: data.horarios_h2_sab ?? DEFAULT_H2_SAB,
          });
        } else {
          const { data: created, error: insertErr } = await supabase
            .from("settings")
            .insert({ user_id: SHARED_USER_ID })
            .select()
            .single();
          if (insertErr) throw insertErr;
          if (created) {
            setSettings({
              ...created,
              config_h1: created.config_h1 as GroupConfig,
              config_h2: created.config_h2 as GroupConfig,
              horarios_h1: created.horarios_h1 ?? DEFAULT_H1,
              horarios_h2: created.horarios_h2 ?? DEFAULT_H2,
              horarios_h1_sab: created.horarios_h1_sab ?? DEFAULT_H1_SAB,
              horarios_h2_sab: created.horarios_h2_sab ?? DEFAULT_H2_SAB,
            });
          }
        }
      } catch (err) {
        console.error("Erro ao carregar configurações:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  const update = useCallback(async (partial: Partial<Omit<Settings, "id" | "user_id">>) => {
    const current = settingsRef.current;
    if (!current) return;
    const previous = { ...current };
    const updated = { ...current, ...partial };
    setSettings(updated);

    try {
      const { error } = await supabase
        .from("settings")
        .update(partial)
        .eq("id", current.id);
      if (error) throw error;
    } catch (err) {
      setSettings(previous);
      console.error("Erro ao salvar configurações:", err);
      throw err;
    }
  }, [supabase]);

  return { settings: settings ?? (defaults as Settings), loading, update };
}

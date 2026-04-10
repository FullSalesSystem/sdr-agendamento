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

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          idRef.current = data.id;
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
          // No settings row — create one without FK constraint
          const { data: created, error: insertErr } = await supabase
            .from("settings")
            .insert({
              user_id: SHARED_USER_ID,
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
            })
            .select()
            .single();
          if (insertErr) throw insertErr;
          if (created) {
            idRef.current = created.id;
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
  }, []);

  const update = useCallback((partial: Partial<Omit<Settings, "id" | "user_id">>) => {
    // Optimistic: update local state immediately
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, ...partial };
    });

    // Persist to DB
    const id = idRef.current;
    if (!id) {
      console.warn("[useSettings] No settings ID — cannot persist");
      return;
    }
    supabaseRef.current
      .from("settings")
      .update(partial)
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          console.error("[useSettings] DB update FAILED:", error.message, error.details, error.hint);
        }
      });
  }, []);

  return { settings: settings ?? (defaults as Settings), loading, update };
}

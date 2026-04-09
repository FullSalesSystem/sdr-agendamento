"use client";

import { useEffect, useState, useCallback } from "react";
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

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", SHARED_USER_ID)
        .single();

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
        const { data: created } = await supabase
          .from("settings")
          .insert({ user_id: SHARED_USER_ID })
          .select()
          .single();
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
      setLoading(false);
    }
    load();
  }, [supabase]);

  const update = useCallback(async (partial: Partial<Omit<Settings, "id" | "user_id">>) => {
    if (!settings) return;
    const updated = { ...settings, ...partial };
    setSettings(updated);

    await supabase
      .from("settings")
      .update(partial)
      .eq("id", settings.id);
  }, [settings, supabase]);

  return { settings: settings ?? (defaults as Settings), loading, update };
}

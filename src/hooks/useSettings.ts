"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Settings, GroupConfig } from "@/lib/types";
import {
  DEFAULT_CLOSERS, DEFAULT_SDRS, DEFAULT_PRODUTOS, DEFAULT_MOTIVOS,
  DEFAULT_CONFIG_H1, DEFAULT_CONFIG_H2,
} from "@/lib/constants";

const defaults: Omit<Settings, "id" | "user_id"> = {
  closers: DEFAULT_CLOSERS,
  sdrs: DEFAULT_SDRS,
  produtos: DEFAULT_PRODUTOS,
  motivos: DEFAULT_MOTIVOS,
  config_h1: DEFAULT_CONFIG_H1,
  config_h2: DEFAULT_CONFIG_H2,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setSettings({
          ...data,
          config_h1: data.config_h1 as GroupConfig,
          config_h2: data.config_h2 as GroupConfig,
        });
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const update = useCallback(async (partial: Partial<Omit<Settings, "id" | "user_id">>) => {
    if (!settings) return;
    const updated = { ...settings, ...partial, updated_at: new Date().toISOString() };
    setSettings(updated);

    await supabase
      .from("settings")
      .update(partial)
      .eq("id", settings.id);
  }, [settings, supabase]);

  return { settings: settings ?? (defaults as Settings), loading, update };
}

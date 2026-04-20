import { DEFAULT_H1, DEFAULT_H1_SAB, DEFAULT_H2, DEFAULT_H2_SAB, ACTIVE_STATUSES } from "./constants";
import type { Agendamento, Settings } from "./types";

/**
 * An appointment is "active" (counts in placards) when:
 * - cancelado is not true
 * - has no cancel_motivo (defensive: catches partial cancels)
 * - status is in ACTIVE_STATUSES ("Agendamento" | "Segunda Reunião")
 */
export function isActiveAg(a: Agendamento): boolean {
  return a.cancelado !== true && !a.cancel_motivo && ACTIVE_STATUSES.includes(a.status);
}

export function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isSun(d: Date | null): boolean {
  return d !== null && d.getDay() === 0;
}

export function isSat(d: Date | null): boolean {
  return d !== null && d.getDay() === 6;
}

export function isToday(d: Date | null): boolean {
  if (!d) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function weekOf(date: Date): Date[] {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return x;
  });
}

export function monthDays(y: number, m: number): Date[] {
  return Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => new Date(y, m, i + 1));
}

export function toWeeks(days: Date[]): (Date | null)[][] {
  const W: (Date | null)[][] = [];
  let w: (Date | null)[] = [];
  for (let i = 0; i < days[0].getDay(); i++) w.push(null);
  for (const d of days) {
    w.push(d);
    if (d.getDay() === 6) {
      W.push(w);
      w = [];
    }
  }
  if (w.length) {
    while (w.length < 7) w.push(null);
    W.push(w);
  }
  return W;
}

type HoursSettings = Pick<Settings, "horarios_h1" | "horarios_h2" | "horarios_h1_sab" | "horarios_h2_sab">;

/** Get the H1 and H2 hour lists for a given date, using settings. */
export function getHoursForDate(date: Date, settings?: HoursSettings) {
  const sat = isSat(date);
  const h1 = sat ? (settings?.horarios_h1_sab ?? DEFAULT_H1_SAB) : (settings?.horarios_h1 ?? DEFAULT_H1);
  const h2 = sat ? (settings?.horarios_h2_sab ?? DEFAULT_H2_SAB) : (settings?.horarios_h2 ?? DEFAULT_H2);
  return { h1, h2 };
}

/** All hours for a date sorted chronologically (:00 and :10 for each) */
export function orderedHours(date: Date, settings?: HoursSettings): string[] {
  const { h1, h2 } = getHoursForDate(date, settings);
  // Deduplicate in case the same hour exists in both groups (config conflict)
  const all = [...new Set([...h1, ...h2])];
  // Each base hour produces :00 (closer) and :10 (overbook)
  return [...all.map((h) => h + ":00"), ...all.map((h) => h + ":10")].sort();
}

/**
 * Like orderedHours but preserves group membership — when the same hour
 * appears in BOTH H1 and H2 it produces TWO entries (one per group),
 * so the grid can render each group's closers independently.
 */
export function orderedSlots(date: Date, settings?: HoursSettings): { h: string; grp: "h1" | "h2" }[] {
  const { h1, h2 } = getHoursForDate(date, settings);
  const slots: { h: string; grp: "h1" | "h2" }[] = [
    ...h1.flatMap((h) => [
      { h: h + ":00", grp: "h1" as const },
      { h: h + ":10", grp: "h1" as const },
    ]),
    ...h2.flatMap((h) => [
      { h: h + ":00", grp: "h2" as const },
      { h: h + ":10", grp: "h2" as const },
    ]),
  ];
  // Sort by time, then h1 before h2 when tied
  return slots.sort((a, b) =>
    a.h < b.h ? -1 : a.h > b.h ? 1 : a.grp < b.grp ? -1 : 1
  );
}

/** Determine if a slot is OB and which group (h1/h2) it belongs to */
export function slotInfo(date: Date, h: string, settings?: HoursSettings): { isOB: boolean; grp: "h1" | "h2" } {
  const { h1, h2 } = getHoursForDate(date, settings);
  const [hh, mm] = h.split(":");
  // If somehow the hour exists in both groups (legacy data), h2 takes priority
  // to preserve the original h2 closers (the most common config issue)
  const inH1 = h1.includes(hh);
  const inH2 = h2.includes(hh);
  return {
    isOB: mm === "10",
    grp: inH2 ? "h2" : inH1 ? "h1" : "h2",
  };
}

export function fmtDateBR(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

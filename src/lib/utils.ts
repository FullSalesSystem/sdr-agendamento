import { H1_BASE, H1_SAB, H2_BASE, H2_SAB } from "./constants";

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

export function orderedHours(date: Date): string[] {
  const sat = isSat(date);
  const a = [...(sat ? H1_SAB : H1_BASE), ...(sat ? H2_SAB : H2_BASE)];
  return [...a.map((h) => h + ":00"), ...a.map((h) => h + ":10")].sort();
}

export function slotInfo(date: Date, h: string): { isOB: boolean; grp: "h1" | "h2" } {
  const sat = isSat(date);
  const [hh, mm] = h.split(":");
  return {
    isOB: mm === "10",
    grp: (sat ? H1_SAB : H1_BASE).includes(hh) ? "h1" : "h2",
  };
}

export function fmtDateBR(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

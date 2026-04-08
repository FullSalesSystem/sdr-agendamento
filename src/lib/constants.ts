export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const DSEM = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const STATUS_LIST = ["Agendamento", "Reagendamento", "Bloqueado", "Livre"];

export const H1_BASE = ["10", "13", "15", "17"];
export const H2_BASE = ["11", "14", "16", "18"];
export const H1_SAB = ["10", "13"];
export const H2_SAB = ["11", "14"];

export const TABS = [
  "Agendamento",
  "Relatório",
  "SDRs",
  "Por Closer",
  "Cancelamentos",
  "Configurações",
] as const;

export type TabName = (typeof TABS)[number];

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Agendamento: { bg: "bg-green-50", text: "text-green-700", border: "border-green-300" },
  Reagendamento: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300" },
  Bloqueado: { bg: "bg-red-50", text: "text-red-700", border: "border-red-300" },
  Livre: { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-300" },
};

export const PRODUTO_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Aceleração: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-300" },
  Bloqueia: { bg: "bg-red-50", text: "text-red-700", border: "border-red-300" },
  Livre: { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-300" },
  Formação: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300" },
  Ativação: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-300" },
  Overbook: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300" },
};

export const DEFAULT_CLOSERS = ["Yan", "José", "Lorraynne"];
export const DEFAULT_SDRS = ["Amiris", "Marina", "Samantha", "Ticiane", "Raúl", "Stella"];
export const DEFAULT_PRODUTOS = ["Aceleração", "Bloqueia", "Livre", "Formação", "Ativação", "Overbook"];
export const DEFAULT_MOTIVOS = ["Lead pediu para reagendar", "No show"];

export const DEFAULT_CONFIG_H1 = { closers: ["Yan", "José", "Lorraynne"], overbook: 1 };
export const DEFAULT_CONFIG_H2 = { closers: ["Yan", "José", "Lorraynne"], overbook: 1 };

// Fixed shared user ID (no auth)
export const SHARED_USER_ID = "00000000-0000-0000-0000-000000000001";

export interface Agendamento {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  horario: string;
  closer: string;
  produto: string;
  sdr: string;
  status: string;
  motivo: string;
  obs: string;
  cancelado: boolean;
  cancel_motivo: string | null;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  closers: string[];
  sdrs: string[];
  produtos: string[];
  motivos: string[];
  config_h1: GroupConfig;
  config_h2: GroupConfig;
}

export interface GroupConfig {
  closers: string[];
  overbook: number;
}

export interface AgendamentoForm {
  horario: string;
  closer: string;
  produto: string;
  sdr: string;
  status: string;
  motivo: string;
  obs: string;
}

export interface SlotEntry {
  id: string;
  horario: string;
  closer: string;
  produto: string;
  sdr: string;
  status: string;
  motivo: string;
  obs: string;
  cancelado: boolean;
  cancel_motivo: string | null;
  date: Date;
}

export interface CloserStats {
  name: string;
  ag: number;
  re: number;
  bl: number;
  ns: number;
}

export interface SDRStats {
  name: string;
  ag: number;
  re: number;
  tot: number;
  ps: string;
}

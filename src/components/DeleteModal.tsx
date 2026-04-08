"use client";

interface Props {
  motivos: string[];
  showGrace: boolean;
  onCancel: (motivo: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export default function DeleteModal({ motivos, showGrace, onCancel, onRemove, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-slate-900/55 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-xs">
        <h2 className="font-bold text-base mb-1">Qual o motivo?</h2>
        <p className="text-sm text-slate-500 mb-5">Selecione para registrar corretamente nas métricas.</p>
        <div className="flex flex-col gap-2">
          {motivos.map((m) => (
            <button
              key={m}
              onClick={() => onCancel(m)}
              className="py-3 px-4 rounded-lg border border-slate-200 bg-slate-50 text-left text-sm font-semibold hover:bg-slate-100 transition-colors text-slate-900"
            >
              {m}
            </button>
          ))}
          {showGrace && (
            <button
              onClick={onRemove}
              className="py-3 px-4 rounded-lg border border-dashed border-slate-300 text-left text-sm text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Erro de cadastro — excluir sem registrar
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-lg border border-slate-200 text-sm text-slate-500 font-semibold hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

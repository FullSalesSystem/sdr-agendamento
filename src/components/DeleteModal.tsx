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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 p-6 w-full max-w-xs animate-slide-up">
        {/* Warning icon */}
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h2 className="font-bold text-base text-center mb-1">Qual o motivo?</h2>
        <p className="text-sm text-slate-400 mb-5 text-center">Selecione para registrar nas métricas.</p>

        <div className="flex flex-col gap-2">
          {motivos.map((m) => (
            <button
              key={m}
              onClick={() => onCancel(m)}
              className="py-3 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-left text-sm font-semibold hover:bg-slate-100 hover:border-slate-300 transition-all text-slate-700"
            >
              {m}
            </button>
          ))}
          {showGrace && (
            <button
              onClick={onRemove}
              className="py-3 px-4 rounded-xl border border-dashed border-slate-200 text-left text-sm text-slate-400 hover:bg-slate-50 hover:text-slate-500 transition-all"
            >
              Erro de cadastro — excluir sem registrar
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 font-semibold hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

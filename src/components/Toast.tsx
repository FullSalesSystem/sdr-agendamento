"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

type ToastType = "success" | "error" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const typeStyles: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  },
};

const textColor: Record<ToastType, string> = {
  success: "text-emerald-700",
  error: "text-red-700",
  warning: "text-amber-700",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  const style = typeStyles[toast.type];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg shadow-slate-900/5 transition-all duration-300 ${style.bg} ${style.border} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <svg className={`w-5 h-5 shrink-0 ${textColor[toast.type]}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d={style.icon} />
      </svg>
      <span className={`text-sm font-medium ${textColor[toast.type]}`}>{toast.message}</span>
      <button
        onClick={onDismiss}
        className={`ml-2 ${textColor[toast.type]} opacity-50 hover:opacity-100 transition-opacity`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

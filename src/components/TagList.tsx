"use client";

import { useState } from "react";

interface TagListProps {
  items: string[];
  onRemove: (item: string) => void;
  onAdd: (item: string) => void;
  placeholder?: string;
}

export default function TagList({ items, onRemove, onAdd, placeholder }: TagListProps) {
  const [value, setValue] = useState("");

  function add() {
    if (value.trim()) {
      onAdd(value.trim());
      setValue("");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((item) => (
          <span
            key={item}
            className="group flex items-center gap-2 bg-gradient-to-b from-blue-50 to-blue-50/50 border border-blue-200/60 rounded-lg pl-3 pr-1.5 py-1 text-sm text-blue-700 font-medium transition-all hover:border-blue-300 hover:shadow-sm"
          >
            {item}
            <button
              onClick={() => onRemove(item)}
              className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded-md w-6 h-6 flex items-center justify-center text-lg leading-none"
              title={`Remover ${item}`}
            >
              ×
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-xs text-slate-400 italic">Nenhum item adicionado</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          placeholder={placeholder}
          className="flex-1 text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-900 placeholder:text-slate-400 transition-all"
        />
        <button
          onClick={add}
          disabled={!value.trim()}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/25"
        >
          +
        </button>
      </div>
    </div>
  );
}

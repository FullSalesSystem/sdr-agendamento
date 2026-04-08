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
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1 bg-blue-50 border border-slate-200 rounded-md px-2.5 py-1 text-sm text-blue-700 font-medium"
          >
            {item}
            <button
              onClick={() => onRemove(item)}
              className="text-red-500 text-base leading-none ml-0.5 hover:text-red-700"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
          placeholder={placeholder}
          className="flex-1 text-sm border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
        />
        <button
          onClick={add}
          className="px-4 py-2 rounded-md bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

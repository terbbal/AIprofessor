"use client";

import { personas } from "@/lib/personas";

interface Props {
  value: string;
  onChange: (id: string) => void;
}

// 페르소나 선택. 말투만 바뀌고 사실/채점 기준은 고정.
export default function PersonaPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {personas.map((p) => {
        const active = p.id === value;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            title={p.tagline}
            className={
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors " +
              (active
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900")
            }
          >
            {p.name}
          </button>
        );
      })}
    </div>
  );
}

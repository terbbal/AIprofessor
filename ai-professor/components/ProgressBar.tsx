interface Props {
  chapterTitle: string;
  current: number; // 1-based
  total: number;
}

export default function ProgressBar({ chapterTitle, current, total }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="border-b border-zinc-200 bg-white px-5 py-3.5">
      <div className="mb-2.5 flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-900">{chapterTitle}</span>
        <span className="text-xs tabular-nums text-zinc-400">
          {current} / {total}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-zinc-900 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

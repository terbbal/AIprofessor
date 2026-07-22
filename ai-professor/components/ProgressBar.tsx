import Link from "next/link";

interface Props {
  chapterTitle: string;
  current: number; // 1-based
  total: number;
  /** 있으면 챕터 제목 앞에 "← 챕터 목록" 뒤로가기 버튼을 표시한다. */
  backHref?: string;
}

export default function ProgressBar({
  chapterTitle,
  current,
  total,
  backHref,
}: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="border-b border-zinc-200 bg-white px-5 py-3.5">
      <div className="mb-2.5 flex items-center justify-between gap-3 text-sm">
        <div className="flex min-w-0 items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
            >
              ‹ 챕터 목록
            </Link>
          )}
          <span className="truncate font-medium text-zinc-900">
            {chapterTitle}
          </span>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-zinc-400">
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

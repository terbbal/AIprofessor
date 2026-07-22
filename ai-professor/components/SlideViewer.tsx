import { SlideNote } from "@/lib/types";

// 왼쪽 슬라이드. 밝은 미니멀 카드 (전체 톤 통일). 이미지 대신 뼈대 노트 텍스트 렌더.
export default function SlideViewer({ note }: { note: SlideNote }) {
  return (
    <div className="flex h-full flex-col justify-center border-r border-zinc-200 bg-zinc-50 p-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400">
          Chapter {note.chapter} · Slide {note.slide}
        </div>
        <h2 className="mb-8 text-3xl font-semibold leading-tight tracking-tight text-zinc-900">
          {note.title}
        </h2>
        <pre className="whitespace-pre-wrap break-words font-sans text-[15px] leading-relaxed text-zinc-600">
          {note.body}
        </pre>
      </div>
    </div>
  );
}

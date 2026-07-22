"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getChapter } from "@/data/chapters";
import { personas } from "@/lib/personas";
import ProgressBar from "@/components/ProgressBar";
import SlideViewer from "@/components/SlideViewer";
import ProfessorChat from "@/components/ProfessorChat";
import PersonaPicker from "@/components/PersonaPicker";

export default function LearnPage({
  params,
}: {
  params: { chapter: string };
}) {
  const chapterNo = Number(params.chapter);
  const chapter = getChapter(chapterNo);

  const [idx, setIdx] = useState(0); // 0-based 슬라이드 인덱스
  const [personaId, setPersonaId] = useState(personas[0].id);
  // slide_no -> understood(true/false). MVP는 로컬 상태 (2주차에 Supabase 연결)
  const [progress, setProgress] = useState<Record<number, boolean>>({});

  const total = chapter?.slides.length ?? 0;

  // 슬라이드가 바뀌면 왼쪽 PDF와 오른쪽 챗봇 설명이 함께 넘어간다.
  const goPrev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setIdx((i) => Math.min(total - 1, i + 1)),
    [total],
  );

  // 키보드 ← → 로 슬라이드 넘기기 (질문 입력 중일 땐 무시)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);
      if (typing) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  if (!chapter) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-zinc-500">
          챕터 {params.chapter} 자료가 아직 없습니다.{" "}
          <Link
            href="/student"
            className="text-zinc-900 underline underline-offset-2"
          >
            홈으로
          </Link>
        </p>
      </div>
    );
  }

  const note = chapter.slides[idx];
  const isFirst = idx === 0;
  const isLast = idx === total - 1;

  function mark(understood: boolean) {
    setProgress((p) => ({ ...p, [note.slide]: understood }));
    if (understood && !isLast) goNext();
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <ProgressBar
        chapterTitle={chapter.title}
        current={idx + 1}
        total={total}
        backHref="/student"
      />

      {/* 본문: 왼쪽 슬라이드(좌우로 넘김) / 오른쪽 실시간 설명·챗 */}
      <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-2">
        <div className="relative hidden overflow-hidden border-r border-zinc-200 bg-zinc-100 md:block">
          {chapter.slidesDir ? (
            // 페이지별 1장짜리 PDF → 현재 슬라이드 "한 장만" 표시 (다른 슬라이드로 스크롤 불가).
            <iframe
              key={note.slide}
              src={`${chapter.slidesDir}/p${note.slide}.pdf#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
              title={`${chapter.title} — 슬라이드 ${note.slide}`}
              className="h-full w-full border-0"
            />
          ) : chapter.pdfUrl ? (
            // 분할본이 없으면 통 PDF에서 해당 페이지로 이동 (다른 페이지도 스크롤 가능).
            <iframe
              key={note.slide}
              src={`${chapter.pdfUrl}#page=${note.slide}&toolbar=0&navpanes=0&view=FitH`}
              title={`${chapter.title} — 슬라이드 ${note.slide}`}
              className="h-full w-full border-0"
            />
          ) : (
            <SlideViewer note={note} />
          )}

          {/* ◀ 이전 슬라이드 (왼쪽 가장자리 오버레이) */}
          <button
            onClick={goPrev}
            disabled={isFirst}
            aria-label="이전 슬라이드"
            className="group absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-0"
          >
            <span className="text-lg leading-none">‹</span>
          </button>

          {/* 다음 슬라이드 ▶ (오른쪽 가장자리 오버레이) */}
          <button
            onClick={goNext}
            disabled={isLast}
            aria-label="다음 슬라이드"
            className="group absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-0"
          >
            <span className="text-lg leading-none">›</span>
          </button>

          {/* 페이지 표시 */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-zinc-900/75 px-3 py-1 text-xs font-medium tabular-nums text-white backdrop-blur">
            {idx + 1} / {total}
          </div>
        </div>

        <ProfessorChat
          key={`${chapterNo}-${note.slide}`}
          chapter={chapterNo}
          slide={note.slide}
          personaId={personaId}
        />
      </div>

      {/* 하단 컨트롤 바 */}
      <div className="border-t border-zinc-200 bg-white px-5 py-3.5">
        <div className="mb-3.5 flex items-center gap-3">
          <span className="shrink-0 text-xs text-zinc-400">교수 스타일</span>
          <PersonaPicker value={personaId} onChange={setPersonaId} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={goPrev}
            disabled={isFirst}
            className="rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-30"
          >
            ‹ 이전
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => mark(false)}
              className={
                "rounded-lg border px-4 py-2 text-sm font-medium transition-colors " +
                (progress[note.slide] === false
                  ? "border-zinc-900 bg-zinc-100 text-zinc-900"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-50")
              }
            >
              아직 이해 안 돼요
            </button>
            <button
              onClick={() => mark(true)}
              disabled={isLast}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-30"
            >
              이해했어요, 다음 ›
            </button>
          </div>
          <button
            onClick={goNext}
            disabled={isLast}
            className="rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-30"
          >
            다음 ›
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-zinc-400">
          {isLast
            ? "챕터의 마지막 슬라이드입니다. 수고했어요."
            : "← → 방향키 또는 슬라이드의 화살표로 넘길 수 있어요."}
        </p>
      </div>
    </div>
  );
}

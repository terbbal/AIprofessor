"use client";

// 업로드된 수업 자료 뷰어 (학생 학습 / 교수 미리보기 공용).
// 자료 소스(manifest)는 동일하고 주변 UI(chrome)만 역할에 따라 달라진다.
//
//   - homeHref     : 홈으로 돌아가는 경로 (역할별 홈)
//   - reuploadHref : 있으면 교수용 → "다시 올리기" 링크·빈 상태 업로드 CTA 노출
//                    없으면 학생용 → 업로드 관련 UI 없음

import { useEffect, useState } from "react";
import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";

interface Manifest {
  kind: "images" | "pdf";
  items: string[];
  updatedAt: string;
}

export default function UploadedViewer({
  homeHref,
  reuploadHref,
}: {
  homeHref: string;
  reuploadHref?: string;
}) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch("/api/upload")
      .then((r) => r.json())
      .then((m: Manifest) => setManifest(m))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-zinc-400">
        불러오는 중…
      </div>
    );
  }

  const empty = !manifest || manifest.items.length === 0;
  if (empty) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        {reuploadHref ? (
          <>
            <p className="text-zinc-500">아직 올린 자료가 없습니다.</p>
            <Link
              href={reuploadHref}
              className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              자료 올리러 가기
            </Link>
          </>
        ) : (
          <>
            <p className="text-zinc-500">아직 올라온 수업 자료가 없어요.</p>
            <p className="text-sm text-zinc-400">
              교수님이 자료를 올리면 학습을 시작할 수 있어요.
            </p>
            <Link
              href={homeHref}
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-900"
            >
              ← 홈으로
            </Link>
          </>
        )}
      </div>
    );
  }

  // PDF: 브라우저 내장 뷰어(iframe)로 그대로 표시. (터널·개발환경에서도 안정적으로 렌더됨)
  if (manifest.kind === "pdf") {
    return (
      <div className="flex h-screen flex-col bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-5 py-3.5 text-sm">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={homeHref}
              className="shrink-0 text-zinc-400 transition-colors hover:text-zinc-900"
            >
              ‹ 홈
            </Link>
            <span className="truncate font-medium text-zinc-900">
              업로드한 수업 자료
            </span>
          </div>
          {reuploadHref && (
            <Link
              href={reuploadHref}
              className="shrink-0 text-zinc-400 transition-colors hover:text-zinc-900"
            >
              다시 올리기 →
            </Link>
          )}
        </div>
        <iframe
          src={`${manifest.items[0]}#view=FitH`}
          title="업로드한 수업 자료"
          className="w-full flex-1 border-0 bg-zinc-100"
        />
      </div>
    );
  }

  // 이미지: 장당 한 슬라이드
  const total = manifest.items.length;
  const isFirst = idx === 0;
  const isLast = idx === total - 1;

  return (
    <div className="flex h-screen flex-col bg-white">
      <ProgressBar chapterTitle="업로드한 자료" current={idx + 1} total={total} />

      <div className="flex flex-1 items-center justify-center overflow-hidden bg-zinc-50 p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={manifest.items[idx]}
          alt={`슬라이드 ${idx + 1}`}
          className="max-h-full max-w-full rounded-lg border border-zinc-200 object-contain shadow-sm"
        />
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200 bg-white px-5 py-3.5">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={isFirst}
          className="rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-30"
        >
          ◀ 이전
        </button>
        <div className="flex items-center gap-4">
          <Link
            href={homeHref}
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-900"
          >
            ← 홈
          </Link>
          {reuploadHref && (
            <Link
              href={reuploadHref}
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-900"
            >
              다시 올리기 →
            </Link>
          )}
        </div>
        <button
          onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
          disabled={isLast}
          className="rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-30"
        >
          다음 ▶
        </button>
      </div>
    </div>
  );
}

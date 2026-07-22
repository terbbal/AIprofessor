"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import PersonaPicker from "@/components/PersonaPicker";
import DocTutorChat from "@/components/DocTutorChat";
import { personas } from "@/lib/personas";

// pdf.js 타입을 느슨하게 (동적 import)
type PdfDoc = { numPages: number; getPage: (n: number) => Promise<any> };

// homeHref/reuploadHref는 뷰어를 감싸는 역할별 chrome. (없으면 링크를 감춤)
export default function PdfLearn({
  url,
  homeHref,
  reuploadHref,
}: {
  url: string;
  homeHref?: string;
  reuploadHref?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<PdfDoc | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1); // 1-based
  const [pageText, setPageText] = useState("");
  const [personaId, setPersonaId] = useState(personas[0].id);
  const [error, setError] = useState("");

  // 현재 페이지를 캔버스에 렌더 + 텍스트 추출
  const renderPage = useCallback(async (n: number) => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;

    // 이전 렌더가 아직 진행 중이면 취소한다. (StrictMode 이중 실행/빠른 페이지 이동 시
    // 같은 canvas에 렌더가 겹치면 pdfjs가 예외를 던지고 화면이 빈 채로 남는다)
    renderTaskRef.current?.cancel();

    setPageText(""); // 새 페이지 → 설명 초기화 신호

    try {
      const pdfPage = await doc.getPage(n);
      const parent = canvas.parentElement;
      // 컨테이너가 아직 레이아웃 전이면(폭 0) 안전한 기본값으로 렌더한다.
      const maxW = ((parent?.clientWidth || 800) - 48) || 752;
      const maxH = ((parent?.clientHeight || 600) - 48) || 552;
      const base = pdfPage.getViewport({ scale: 1 });
      const scale = Math.max(0.1, Math.min(maxW / base.width, maxH / base.height));
      const dpr = window.devicePixelRatio || 1;
      const viewport = pdfPage.getViewport({ scale: scale * dpr });

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;

      const task = pdfPage.render({ canvas, canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      await task.promise;

      // 텍스트 추출 (설명 근거)
      const tc = await pdfPage.getTextContent();
      const text = tc.items.map((it: any) => it.str).join(" ");
      setPageText(text);
    } catch (e: any) {
      // 렌더 취소는 정상 흐름 → 무시. 그 외 에러만 화면에 표시.
      if (e?.name === "RenderingCancelledException") return;
      setError(`PDF 페이지를 그리지 못했습니다: ${e?.message ?? e}`);
    }
  }, []);

  // PDF 로드
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 레거시 빌드: 번들러(webpack) 호환성을 위해 트랜스파일된 버전.
        // 메인 빌드는 Next/webpack과 궁합 문제로 "Object.defineProperty called on
        // non-object" 등 워커 초기화 오류를 일으켜 레거시로 고정한다.
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        // public/ 워커도 legacy 워커로 교체됨(버전 동일).
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjs.getDocument(url).promise;
        if (cancelled) return;
        docRef.current = doc as unknown as PdfDoc;
        setNumPages(doc.numPages);
        setPage(1);
      } catch (e: any) {
        // 진짜 원인을 화면·콘솔에 그대로 드러낸다.
        console.error("[PdfLearn] load failed:", e);
        if (!cancelled) setError(`PDF를 불러오지 못했습니다: ${e?.message ?? e}`);
      }
    })();
    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [url]);

  // 페이지가 바뀌면 렌더
  useEffect(() => {
    if (numPages > 0) renderPage(page);
  }, [page, numPages, renderPage]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-zinc-500">
        {error}
      </div>
    );
  }

  const isFirst = page <= 1;
  const isLast = page >= numPages;

  return (
    <div className="flex h-screen flex-col bg-white">
      <ProgressBar
        chapterTitle="업로드한 수업 자료"
        current={numPages ? page : 0}
        total={numPages || 1}
      />

      <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-2">
        {/* 왼쪽: PDF 한 페이지 */}
        <div className="hidden items-center justify-center overflow-hidden border-r border-zinc-200 bg-zinc-50 p-6 md:flex">
          <canvas
            ref={canvasRef}
            className="rounded-lg border border-zinc-200 bg-white shadow-sm"
          />
        </div>

        {/* 오른쪽: 그 페이지를 설명하는 챗봇 */}
        <DocTutorChat page={page} pageText={pageText} personaId={personaId} />
      </div>

      {/* 하단 컨트롤 */}
      <div className="border-t border-zinc-200 bg-white px-5 py-3.5">
        <div className="mb-3.5 flex items-center gap-3">
          <span className="shrink-0 text-xs text-zinc-400">교수 스타일</span>
          <PersonaPicker value={personaId} onChange={setPersonaId} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={isFirst}
            className="rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-30"
          >
            ◀ 이전
          </button>
          <div className="flex items-center gap-4">
            {homeHref && (
              <Link
                href={homeHref}
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-900"
              >
                ← 홈
              </Link>
            )}
            <span className="text-xs tabular-nums text-zinc-400">
              {numPages ? `${page} / ${numPages}` : "…"}
            </span>
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
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            disabled={isLast}
            className="rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-30"
          >
            다음 ▶
          </button>
        </div>
      </div>
    </div>
  );
}

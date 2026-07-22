"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Material {
  id: string;
  title: string;
  slideCount: number;
  pdfUrl?: string;
}

// 교수 미리보기 = 지금까지 올린 수업 자료(PDF)를 리스트로 보고, 선택하면 그 PDF를 미리본다.
export default function ProfessorPreview() {
  const [materials, setMaterials] = useState<Material[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/chapters")
      .then((r) => r.json())
      .then((list: Material[]) => {
        const pdfs = list.filter((m) => m.pdfUrl);
        setMaterials(pdfs);
        setSelected(pdfs[0]?.id ?? null);
      })
      .catch(() => setMaterials([]));
  }, []);

  const current = materials?.find((m) => m.id === selected) ?? null;

  return (
    <main className="flex h-screen flex-col bg-white">
      {/* 상단 바 */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-5 py-3.5 text-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/professor"
            className="text-zinc-400 transition-colors hover:text-zinc-900"
          >
            ‹ 교수 홈
          </Link>
          <span className="font-medium text-zinc-900">올린 수업 자료</span>
          {materials && (
            <span className="text-xs text-zinc-400">{materials.length}개</span>
          )}
        </div>
        <Link
          href="/professor/upload"
          className="rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
        >
          + 새 자료 올리기
        </Link>
      </div>

      {materials === null ? (
        <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">
          불러오는 중…
        </div>
      ) : materials.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-zinc-500">아직 올린 자료가 없습니다.</p>
          <Link
            href="/professor/upload"
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            자료 올리러 가기
          </Link>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[300px_1fr]">
          {/* 왼쪽: 올린 자료 리스트 */}
          <div className="overflow-y-auto border-b border-zinc-200 md:border-b-0 md:border-r">
            <ul className="divide-y divide-zinc-100">
              {materials.map((m, i) => {
                const active = m.id === selected;
                return (
                  <li key={m.id}>
                    <button
                      onClick={() => setSelected(m.id)}
                      className={
                        "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors " +
                        (active ? "bg-zinc-100" : "hover:bg-zinc-50")
                      }
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xs font-semibold text-white">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-zinc-900">
                          {m.title}
                        </div>
                        <div className="text-xs text-zinc-400">
                          슬라이드 {m.slideCount}장
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 오른쪽: 선택한 자료 PDF 미리보기 */}
          <div className="relative hidden flex-col overflow-hidden bg-zinc-100 md:flex">
            {current?.pdfUrl ? (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-2.5 text-sm">
                  <span className="truncate font-medium text-zinc-900">
                    {current.title}
                  </span>
                  <div className="flex shrink-0 items-center gap-3 text-xs">
                    <a
                      href={current.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 transition-colors hover:text-zinc-900"
                    >
                      새 탭에서 열기 ↗
                    </a>
                    <Link
                      href={`/student/learn/${encodeURIComponent(current.id)}`}
                      className="text-zinc-400 transition-colors hover:text-zinc-900"
                    >
                      학생 화면으로 보기 →
                    </Link>
                  </div>
                </div>
                <iframe
                  key={current.id}
                  src={`${current.pdfUrl}#view=FitH`}
                  title={current.title}
                  className="w-full flex-1 border-0"
                />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">
                왼쪽에서 자료를 선택하세요.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

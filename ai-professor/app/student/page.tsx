"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { useAppSession } from "@/components/RoleGuard";

interface ChapterSummary {
  id: string;
  title: string;
  slideCount: number;
}

// 가드·역할 검사는 상위 layout.tsx(RoleGuard)가 담당. 여기선 세션만 읽어 화면을 그린다.
export default function StudentHome() {
  const session = useAppSession();
  // 챕터 = 교수가 올린 수업 자료. 업로드 즉시 반영되도록 API에서 읽는다.
  const [chapters, setChapters] = useState<ChapterSummary[] | null>(null);

  useEffect(() => {
    fetch("/api/chapters")
      .then((r) => r.json())
      .then((data: ChapterSummary[]) => setChapters(data))
      .catch(() => setChapters([]));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <AppHeader title="AI 교수 · 학생" />

      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-zinc-900">
          안녕하세요{session.name ? `, ${session.name}` : ""}
        </h1>
        <p className="mb-10 text-zinc-500">
          학습할 챕터를 선택하세요. AI 교수가 슬라이드를 하나씩 설명해 드려요.
        </p>

        {chapters === null ? (
          <div className="py-16 text-center text-sm text-zinc-400">
            챕터를 불러오는 중…
          </div>
        ) : chapters.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 px-6 py-16 text-center">
            <p className="text-zinc-500">아직 올라온 수업 자료가 없어요.</p>
            <p className="mt-1 text-sm text-zinc-400">
              교수님이 자료를 올리면 여기에 챕터가 나타납니다.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {chapters.map((ch, i) => (
              <li key={ch.id}>
                <Link
                  href={`/student/learn/${encodeURIComponent(ch.id)}`}
                  className="flex items-center gap-4 rounded-xl border border-zinc-200 p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-white">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-medium text-zinc-900">
                      {ch.title}
                    </div>
                    <div className="mt-0.5 text-sm text-zinc-400">
                      슬라이드 {ch.slideCount}장
                    </div>
                  </div>
                  <span className="shrink-0 text-zinc-300">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

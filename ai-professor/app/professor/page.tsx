"use client";

import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { useAppSession } from "@/components/RoleGuard";

// 가드·역할 검사는 상위 layout.tsx(RoleGuard)가 담당. 여기선 세션만 읽어 화면을 그린다.
export default function ProfessorHome() {
  const session = useAppSession();

  return (
    <main className="min-h-screen bg-white">
      <AppHeader title="AI 교수 · 교수" />

      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-zinc-900">
          안녕하세요{session.name ? `, ${session.name}` : ""} 교수님
        </h1>
        <p className="mb-10 text-zinc-500">
          수업 자료를 올리면 학생 화면에 그대로 보입니다.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/professor/upload"
            className="rounded-xl border border-zinc-200 p-5 transition-colors hover:bg-zinc-50"
          >
            <div className="text-base font-medium text-zinc-900">
              수업 자료 올리기
            </div>
            <div className="mt-1 text-sm text-zinc-400">
              이미지(슬라이드) 또는 PDF 업로드
            </div>
          </Link>
          <Link
            href="/professor/preview"
            className="rounded-xl border border-zinc-200 p-5 transition-colors hover:bg-zinc-50"
          >
            <div className="text-base font-medium text-zinc-900">
              올린 자료 미리보기
            </div>
            <div className="mt-1 text-sm text-zinc-400">
              학생에게 보이는 화면 확인
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

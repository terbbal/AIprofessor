"use client";

// 홈 화면 공통 상단바. 가드 Context의 세션으로 이름·로그아웃을 렌더한다.
// (풀스크린 학습/미리보기 뷰어에는 자체 상단바가 있어 이 헤더를 쓰지 않는다.)

import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";
import { useAppSession } from "@/components/RoleGuard";

export default function AppHeader({ title }: { title: string }) {
  const router = useRouter();
  const session = useAppSession();

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3.5">
      <span className="text-sm font-medium text-zinc-900">{title}</span>
      <div className="flex items-center gap-3 text-sm text-zinc-400">
        <span>{session.name ?? session.email}</span>
        <button
          onClick={() => {
            clearSession();
            router.replace("/login");
          }}
          className="transition-colors hover:text-zinc-900"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}

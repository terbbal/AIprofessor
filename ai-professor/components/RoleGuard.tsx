"use client";

// 역할 기반 접근 가드. /professor/* 와 /student/* 각각의 layout.tsx 에서 한 번만 감싸면
// 하위 모든 페이지가 자동으로 보호된다. (세션은 localStorage 기반이라 클라이언트에서 검사)
//
// - 세션 없음        → /login
// - 역할 불일치      → 자기 역할 홈으로
// - 통과            → 세션을 Context로 내려 하위 페이지가 재조회 없이 사용

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSession, roleHome, Role, Session } from "@/lib/auth";

const SessionContext = createContext<Session | null>(null);

// 가드를 통과한 하위 페이지에서 세션을 읽는다. (가드 밖에서 호출하면 null)
export function useAppSession(): Session {
  const s = useContext(SessionContext);
  if (!s) throw new Error("useAppSession must be used within a RoleGuard");
  return s;
}

export default function RoleGuard({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) return router.replace("/login");
    if (s.role !== role) return router.replace(roleHome[s.role]);
    setSession(s);
  }, [role, router]);

  // 검사 전에는 아무것도 렌더하지 않아 다른 역할 화면이 깜빡이지 않게 한다.
  if (!session) return null;

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

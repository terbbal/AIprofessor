"use client";

// 데모 로그인 세션 (브라우저 localStorage 기반).
// 다음 단계에서 Supabase Auth로 교체 가능하도록 인터페이스를 얇게 유지한다.

export type Role = "professor" | "student";

export interface Session {
  role: Role;
  email: string;
  name?: string;
}

const KEY = "ai-prof-session";

export function setSession(s: Session): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(KEY);
}

export const roleLabel: Record<Role, string> = {
  professor: "교수",
  student: "학생",
};

export const roleHome: Record<Role, string> = {
  professor: "/professor",
  student: "/student",
};

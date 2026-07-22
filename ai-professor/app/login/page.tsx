"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setSession, roleHome, Role, Session } from "@/lib/auth";

// 데모용 샘플 계정
const SAMPLES: Session[] = [
  { role: "professor", email: "prof@ai.edu", name: "김교수" },
  { role: "student", email: "student@ai.edu", name: "이학생" },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const mail = email.trim();
    if (!mail) {
      setError("이메일을 입력해 주세요.");
      return;
    }
    setSession({ role, email: mail, name: name.trim() || undefined });
    router.push(roleHome[role]);
  }

  function loginAs(s: Session) {
    setSession(s);
    router.push(roleHome[s.role]);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <div className="mb-1 text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          프로그래밍 언어론
        </div>
        <h1 className="mb-10 text-center text-3xl font-semibold tracking-tight text-zinc-900">
          AI 교수
        </h1>

        {/* 역할 선택 */}
        <div className="mb-5">
          <div className="mb-2 text-xs font-medium text-zinc-400">역할</div>
          <div className="grid grid-cols-2 gap-2">
            {(["student", "professor"] as Role[]).map((r) => {
              const active = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={
                    "rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors " +
                    (active
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900")
                  }
                >
                  {r === "student" ? "학생" : "교수"}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">
              이름 <span className="text-zinc-300">(선택)</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            {role === "professor" ? "교수로 로그인" : "학생으로 로그인"}
          </button>
        </form>

        {/* 샘플 계정 빠른 로그인 */}
        <div className="mt-8 border-t border-zinc-100 pt-6">
          <div className="mb-2 text-center text-xs font-medium text-zinc-400">
            샘플 계정으로 바로 로그인
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s.role}
                type="button"
                onClick={() => loginAs(s)}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-left transition-colors hover:bg-zinc-50"
              >
                <div className="text-sm font-medium text-zinc-900">
                  {s.role === "professor" ? "교수" : "학생"} · {s.name}
                </div>
                <div className="text-xs text-zinc-400">{s.email}</div>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-zinc-400">
          데모 로그인입니다. 실제 인증(Supabase)은 다음 단계에서 연결됩니다.
        </p>
      </div>
    </main>
  );
}

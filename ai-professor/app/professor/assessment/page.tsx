"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";

interface ChapterSummary {
  id: string;
  title: string;
  slideCount: number;
}
interface Problem {
  id: string;
  difficulty: "easy" | "medium" | "hard" | "essay";
  type: string;
  question: string;
  answer?: string;
  rubric?: { item: string; points: number }[];
  sourceSlide: number;
  sourceTitle: string;
}
interface ExamResult {
  chapterTitle: string;
  demo: boolean;
  problems: Problem[];
}

const DIFF: Record<
  Problem["difficulty"],
  { label: string; cls: string }
> = {
  easy: { label: "쉬움", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  medium: { label: "중간", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  hard: { label: "어려움", cls: "bg-rose-50 text-rose-700 border-rose-200" },
  essay: { label: "서술형", cls: "bg-violet-50 text-violet-700 border-violet-200" },
};

export default function AssessmentPage() {
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [chapterId, setChapterId] = useState("");
  const [counts, setCounts] = useState({ easy: 4, medium: 4, hard: 2, essay: 2 });
  const [result, setResult] = useState<ExamResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/chapters")
      .then((r) => r.json())
      .then((list: ChapterSummary[]) => {
        setChapters(list);
        setChapterId(list[0]?.id ?? "");
      })
      .catch(() => setChapters([]));
  }, []);

  const total = counts.easy + counts.medium + counts.hard + counts.essay;

  async function generate() {
    if (!chapterId || total === 0) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, counts }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
    } finally {
      setBusy(false);
    }
  }

  function Counter({ k, label }: { k: keyof typeof counts; label: string }) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2">
        <span className="text-sm text-zinc-600">{label}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCounts((c) => ({ ...c, [k]: Math.max(0, c[k] - 1) }))}
            className="h-6 w-6 rounded border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50"
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-medium tabular-nums text-zinc-900">
            {counts[k]}
          </span>
          <button
            onClick={() => setCounts((c) => ({ ...c, [k]: Math.min(20, c[k] + 1) }))}
            className="h-6 w-6 rounded border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <AppHeader title="AI 교수 · 교수" />

      <div className="mx-auto max-w-3xl px-6 py-14">
        <Link
          href="/professor"
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-900"
        >
          ‹ 교수 홈
        </Link>

        <h1 className="mb-2 mt-6 text-3xl font-semibold tracking-tight text-zinc-900">
          평가하기
        </h1>
        <p className="mb-6 text-zinc-500">
          시험 출제와 채점. 배움의 세계와 분리된 <b>중립 영역</b>이라 페르소나가
          개입하지 않고, 공식 성적은 오프라인 시험으로만 정합니다.
        </p>

        {/* 중립성 원칙 배너 */}
        <div className="mb-10 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          ⚖️ <b>평가의 세계 원칙</b> — 슬라이드·뼈대 노트에 <b>근거해서만</b> 출제하고,
          모든 문제에 <b>출처 슬라이드</b>를 남깁니다. 안 배운 내용은 출제되지 않습니다.
        </div>

        {/* ── 출제 ──────────────────────────────── */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">① 출제</h2>

          <div className="rounded-xl border border-zinc-200 p-5">
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              대상 챕터
            </label>
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              className="mb-5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
            >
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} (슬라이드 {c.slideCount}장)
                </option>
              ))}
            </select>

            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              난이도·유형 배분 (사람이 지정)
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Counter k="easy" label="쉬움" />
              <Counter k="medium" label="중간" />
              <Counter k="hard" label="어려움" />
              <Counter k="essay" label="서술형" />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={generate}
                disabled={busy || !chapterId || total === 0}
                className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-30"
              >
                {busy ? "출제 중…" : `문제 출제 (${total}문항)`}
              </button>
              <span className="text-xs text-zinc-400">
                생성된 문제는 교수/조교 최종 승인 후 사용합니다.
              </span>
            </div>
          </div>

          {/* 출제 결과 */}
          {result && (
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500">
                <span className="font-medium text-zinc-900">
                  {result.chapterTitle}
                </span>
                <span>· {result.problems.length}문항</span>
                {result.demo && (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                    데모(개념 증명) · API 키 연결 시 실제 AI 출제
                  </span>
                )}
              </div>

              <ol className="space-y-3">
                {result.problems.map((p, i) => {
                  const d = DIFF[p.difficulty];
                  const isOpen = open[p.id];
                  return (
                    <li
                      key={p.id}
                      className="rounded-xl border border-zinc-200 p-4"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900">
                          {i + 1}.
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${d.cls}`}
                        >
                          {d.label}
                        </span>
                        <span className="text-xs text-zinc-400">{p.type}</span>
                        <span className="ml-auto text-xs text-zinc-400">
                          출처: 슬라이드 {p.sourceSlide}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                        {p.question}
                      </p>

                      <button
                        onClick={() =>
                          setOpen((o) => ({ ...o, [p.id]: !o[p.id] }))
                        }
                        className="mt-3 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                      >
                        {isOpen ? "▲ 정답·루브릭 숨기기" : "▼ 정답·루브릭 보기"}
                      </button>

                      {isOpen && (
                        <div className="mt-2 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
                          {p.answer && (
                            <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                              {p.answer}
                            </pre>
                          )}
                          {p.rubric && (
                            <ul className="space-y-1">
                              {p.rubric.map((r, j) => (
                                <li key={j} className="flex justify-between">
                                  <span>{r.item}</span>
                                  <span className="tabular-nums text-zinc-400">
                                    {r.points}점
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </section>

        {/* ── 채점 ──────────────────────────────── */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">② 채점</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 p-5">
              <div className="mb-1 text-base font-medium text-zinc-900">
                자동 검증형
              </div>
              <p className="text-sm leading-relaxed text-zinc-500">
                파스트리·CFG 생성 등은 검증 엔진이 <b>실제로 파싱</b>해 판정 —
                기계적·100% 일관.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 p-5">
              <div className="mb-1 text-base font-medium text-zinc-900">
                서술·설계형 (루브릭)
              </div>
              <p className="text-sm leading-relaxed text-zinc-500">
                채점 전 루브릭 확정 → 점수마다 근거 부착 → 일관성 검사 → 교수는
                경계선만 검수.
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            채점은 학생 답안 수집 후 단계 — 현재는 출제·검증 개념 증명에 집중합니다.
          </p>
        </section>

        {/* ── 검증 엔진 ─────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            ③ 검증 엔진 <span className="text-sm font-normal text-zinc-400">(킬러 기능)</span>
          </h2>
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-5">
            <p className="text-sm leading-relaxed text-zinc-600">
              학생이 낸 문법/파스트리를 <b>실제로 파싱해서</b> 정오를 판정하는
              엔진. 출제 검증과 자동 채점 양쪽의 핵심 — 이 과목이라서 가능한
              차별점입니다.
            </p>
            <div className="mt-3 inline-block rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-500">
              다음 단계: CFG 문제 1개 자동 검증 개념 증명
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

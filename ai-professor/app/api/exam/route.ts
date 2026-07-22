import { getChapterById } from "@/lib/chapterStore";
import { getClient } from "@/lib/anthropic";
import { Chapter } from "@/lib/types";

// 출제 모듈 (평가의 세계 · 페르소나 없음 · 중립).
// 기획 §4.1: 슬라이드/뼈대 노트에 "근거해서만" 출제 + 출처 추적.
// API 키가 없으면 뼈대 노트로 만든 데모 문제를 반환한다(개념 증명).
export const runtime = "nodejs";

type Difficulty = "easy" | "medium" | "hard" | "essay";

interface Problem {
  id: string;
  difficulty: Difficulty;
  type: string;
  question: string;
  answer?: string; // 자동/단답형 정답
  rubric?: { item: string; points: number }[]; // 서술형 루브릭
  sourceSlide: number; // 출처 추적
  sourceTitle: string;
}

interface Counts {
  easy: number;
  medium: number;
  hard: number;
  essay: number;
}

// 슬라이드 뼈대 노트로 만드는 데모 출제기. (사실은 노트를 벗어나지 않음)
function generateDemo(ch: Chapter, counts: Counts): Problem[] {
  const slides = ch.slides.filter((s) => (s.key_facts?.length ?? 0) > 0);
  const problems: Problem[] = [];
  let n = 0;
  const pick = () => slides[n % slides.length];

  const push = (d: Difficulty, make: (s: Chapter["slides"][number]) => Problem) => {
    if (slides.length === 0) return;
    const s = pick();
    n++;
    problems.push(make(s));
  };

  for (let i = 0; i < counts.easy; i++)
    push("easy", (s) => ({
      id: `e${i}`,
      difficulty: "easy",
      type: "진위형",
      question: `다음 설명이 옳은지 판단하고, 틀렸다면 바르게 고치시오.\n"${s.key_facts[i % s.key_facts.length]}"`,
      answer: `참 — 근거: [슬라이드 ${s.slide}] ${s.title}`,
      sourceSlide: s.slide,
      sourceTitle: s.title,
    }));

  for (let i = 0; i < counts.medium; i++)
    push("medium", (s) => ({
      id: `m${i}`,
      difficulty: "medium",
      type: "단답/개념",
      question: `'${s.title}'의 핵심 개념을 간단히 설명하시오.`,
      answer: s.key_facts.map((f) => `• ${f}`).join("\n"),
      sourceSlide: s.slide,
      sourceTitle: s.title,
    }));

  for (let i = 0; i < counts.hard; i++)
    push("hard", (s) => ({
      id: `h${i}`,
      difficulty: "hard",
      type: "적용/분석",
      question:
        (s.common_misconceptions?.length
          ? `'${s.title}'에서 학생들이 자주 하는 오해를 하나 지적하고, 왜 틀렸는지 설명하시오.`
          : `'${s.title}' 개념을 구체적인 예를 들어 적용해 설명하시오.`),
      answer:
        (s.common_misconceptions?.length
          ? `오개념: ${s.common_misconceptions[0]}\n바로잡기 근거: ${s.key_facts[0]}`
          : s.key_facts.map((f) => `• ${f}`).join("\n")),
      sourceSlide: s.slide,
      sourceTitle: s.title,
    }));

  for (let i = 0; i < counts.essay; i++)
    push("essay", (s) => ({
      id: `s${i}`,
      difficulty: "essay",
      type: "서술/설계",
      question: `다음 주제에 대해 개념의 의의와 설계상의 고려점을 논술하시오: '${s.title}'`,
      rubric: [
        { item: "핵심 개념의 정확성", points: 4 },
        { item: "근거·예시의 적절성", points: 3 },
        { item: "논리 전개와 서술 완성도", points: 3 },
      ],
      sourceSlide: s.slide,
      sourceTitle: s.title,
    }));

  return problems;
}

export async function POST(req: Request) {
  const { chapterId, counts } = (await req.json()) as {
    chapterId: string;
    counts: Counts;
  };

  const ch = await getChapterById(String(chapterId));
  if (!ch) {
    return Response.json({ error: "챕터를 찾을 수 없습니다." }, { status: 404 });
  }
  const safe: Counts = {
    easy: Math.max(0, Math.min(20, Number(counts?.easy) || 0)),
    medium: Math.max(0, Math.min(20, Number(counts?.medium) || 0)),
    hard: Math.max(0, Math.min(20, Number(counts?.hard) || 0)),
    essay: Math.max(0, Math.min(20, Number(counts?.essay) || 0)),
  };

  // 지금은 개념 증명: 뼈대 노트 기반 데모 출제. (API 키를 넣으면 이 자리에서 LLM 출제로 교체)
  const client = getClient();
  const problems = generateDemo(ch, safe);

  return Response.json({
    chapterId: ch.id,
    chapterTitle: ch.title,
    demo: !client, // 키 없으면 데모 표시
    problems,
  });
}

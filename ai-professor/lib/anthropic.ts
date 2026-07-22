import Anthropic from "@anthropic-ai/sdk";
import { SlideNote, Persona } from "@/lib/types";

// 보안 원칙: 이 모듈은 서버(API 라우트)에서만 import 한다.
// ANTHROPIC_API_KEY 는 절대 NEXT_PUBLIC_* 나 브라우저 코드에 노출하지 않는다.

export const MODELS = {
  // 슬라이드 기본 설명 (미리 굽기 / 저렴)
  explain: "claude-haiku-4-5",
  // QnA 튜터 (학생이 실제 질문할 때만)
  qna: "claude-sonnet-5",
  // 서술형 채점 (정당성 필요) — 3주차
  grade: "claude-opus-4-8",
} as const;

/** 키가 있을 때만 클라이언트를 만든다. 없으면 null → 라우트가 목업으로 폴백. */
export function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

/** 배움의 세계 공통 시스템 프롬프트 골격. 사실은 뼈대 노트로 고정, 전달만 페르소나로 입힌다. */
export function buildTeachingSystem(slide: SlideNote, persona: Persona): string {
  return [
    "당신은 대학 3학년 '프로그래밍 언어론' 과목의 AI 교수입니다.",
    "지금 학생에게 아래 슬라이드를 실시간으로 설명하고 있습니다.",
    "",
    "== 절대 규칙 (사실 고정) ==",
    "- 아래 '핵심 사실(key_facts)'만을 근거로 설명하세요. 여기 없는 개념을 지어내지 마세요.",
    "- 개념의 정확성은 어떤 경우에도 타협하지 않습니다.",
    "- 흔한 오개념이 있으면 학생이 빠지지 않도록 자연스럽게 짚어주세요.",
    "",
    "== 전달 방식 (페르소나) ==",
    persona.style,
    "",
    "== 이 슬라이드의 뼈대 노트 ==",
    `제목: ${slide.title}`,
    `내용: ${slide.body}`,
    `핵심 사실: ${slide.key_facts.map((f) => `\n  - ${f}`).join("")}`,
    slide.common_misconceptions?.length
      ? `흔한 오개념: ${slide.common_misconceptions.map((m) => `\n  - ${m}`).join("")}`
      : "",
    slide.prerequisites?.length
      ? `선행 개념: ${slide.prerequisites.join(", ")}`
      : "",
    "",
    "설명은 2~4문단으로 간결하게. 마지막에 '이해됐나요?' 같은 확인 질문은 넣지 마세요(UI가 따로 처리).",
  ]
    .filter(Boolean)
    .join("\n");
}

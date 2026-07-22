import { getClient, buildTeachingSystem, MODELS } from "@/lib/anthropic";
import { anthropicTextStream, mockTextStream } from "@/lib/stream";
import { getPersona } from "@/lib/personas";
import { getChapter } from "@/data/chapters";

// 슬라이드 기본 설명 (Haiku, 스트리밍). 서버 전용.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { chapter, slide, personaId } = await req.json();

  const ch = getChapter(Number(chapter));
  const note = ch?.slides.find((s) => s.slide === Number(slide));
  if (!note) {
    return new Response("슬라이드를 찾을 수 없습니다.", { status: 404 });
  }
  const persona = getPersona(personaId);
  const client = getClient();

  // 키가 없으면 뼈대 노트로 만든 목업 설명을 스트리밍 (키 없이도 데모).
  if (!client) {
    const mock =
      `[데모 모드] "${note.title}"\n\n` +
      note.key_facts.map((f) => `• ${f}`).join("\n") +
      (note.common_misconceptions?.length
        ? `\n\n자주 하는 실수: ${note.common_misconceptions[0]}`
        : "") +
      `\n\n(실제 AI 설명을 보려면 .env.local 에 ANTHROPIC_API_KEY 를 설정하세요.)`;
    return mockTextStream(mock);
  }

  const system = buildTeachingSystem(note, persona);
  return anthropicTextStream(client, {
    model: MODELS.explain,
    max_tokens: 1024,
    system: [
      // 고정 부분(뼈대 노트 포함 시스템 프롬프트) 캐싱 → 반복 호출 입력비 절감
      { type: "text", text: system, cache_control: { type: "ephemeral" } },
    ],
    messages: [
      { role: "user", content: "이 슬라이드를 설명해 주세요." },
    ],
  });
}

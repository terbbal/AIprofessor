import { getClient, MODELS } from "@/lib/anthropic";
import { anthropicTextStream, mockTextStream } from "@/lib/stream";
import { getPersona } from "@/lib/personas";
import { getChapterById } from "@/lib/chapterStore";

// QnA 튜터 (Sonnet, 스트리밍). 현재 슬라이드 + 앞 슬라이드 맥락 포함. 서버 전용.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { chapter, slide, personaId, question } = await req.json();

  const ch = await getChapterById(String(chapter));
  if (!ch || !question) {
    return new Response("잘못된 요청입니다.", { status: 400 });
  }
  const persona = getPersona(personaId);
  const client = getClient();

  if (!client) {
    return mockTextStream(
      `[데모 모드] 좋은 질문이에요! 실제 AI 튜터의 답변을 보려면 .env.local 에 ANTHROPIC_API_KEY 를 설정하세요.\n\n질문: "${question}"`,
    );
  }

  // 현재 슬라이드까지의 맥락을 모두 뼈대 노트로 제공 (안 배운 건 근거로 쓰지 않도록)
  const seen = ch.slides.filter((s) => s.slide <= Number(slide));
  const context = seen
    .map(
      (s) =>
        `[슬라이드 ${s.slide}] ${s.title}\n` +
        s.key_facts.map((f) => `  - ${f}`).join("\n"),
    )
    .join("\n\n");

  const system = [
    "당신은 대학 3학년 '프로그래밍 언어론' 과목의 AI 교수입니다. 학생의 질문에 답하는 QnA 튜터로 동작합니다.",
    "",
    "== 절대 규칙 ==",
    "- 아래 '지금까지 배운 내용'만을 근거로 답하세요. 아직 안 배운 개념은 '그건 뒤에서 다룰 내용이에요'라고 안내하세요.",
    "- 개념의 정확성은 절대 타협하지 않습니다. 확실하지 않으면 모른다고 하세요.",
    "- 가능하면 바로 정답을 주기보다, 학생이 스스로 도달하도록 짧은 되물음을 한 번 섞으세요(소크라테스식). 단, 학생이 답답해하면 바로 알려주세요.",
    "",
    "== 전달 방식 (페르소나) ==",
    persona.style,
    "",
    "== 지금까지 배운 내용 ==",
    context,
  ].join("\n");

  return anthropicTextStream(client, {
    model: MODELS.qna,
    max_tokens: 1024,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: String(question) }],
  });
}

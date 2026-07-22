import { getClient, MODELS } from "@/lib/anthropic";
import { anthropicTextStream, mockTextStream } from "@/lib/stream";
import { getPersona } from "@/lib/personas";

// 업로드된 PDF 페이지 기반 튜터.
// mode=explain: 현재 페이지를 설명 / mode=qna: 현재 페이지 맥락으로 질문 답변.
// 근거는 클라이언트(pdf.js)가 추출해 보낸 pageText. 서버 전용.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { mode, page, pageText, personaId, question } = await req.json();
  const persona = getPersona(personaId);
  const client = getClient();
  const text = String(pageText ?? "").trim();

  // 텍스트를 추출할 수 없는 경우 (이미지 기반 PDF 등)
  if (!text) {
    return mockTextStream(
      "이 페이지에서는 글자를 읽어낼 수 없었어요. 그림/스캔 기반 슬라이드일 수 있습니다. (이미지 슬라이드 설명은 다음 단계에서 지원 예정)",
    );
  }

  if (!client) {
    // 데모 모드: 페이지 텍스트를 근거로 한국어 튜터처럼 안내 (API 키 없이도 자연스럽게)
    const lines = text
      .split(/(?<=[.!?])\s+|\s{2,}/)
      .map((s) => s.trim())
      .filter(Boolean);
    const title = lines[0] ?? `${page}페이지`;
    const points = lines.slice(1, 5);

    if (mode === "qna") {
      return mockTextStream(
        `좋은 질문이에요. 이 페이지의 내용을 함께 살펴볼게요.\n\n` +
          `"${question}"에 대해서는, 지금 슬라이드에서 이렇게 다루고 있어요:\n` +
          points.map((p) => `· ${p}`).join("\n") +
          `\n\n이 부분을 기준으로 생각해 보면 이해에 도움이 될 거예요. 더 궁금한 점이 있으면 이어서 물어보세요.`,
      );
    }
    return mockTextStream(
      `이번 슬라이드는 "${title}"에 대한 내용이에요.\n\n` +
        `핵심을 짚어보면 이렇습니다:\n` +
        points.map((p) => `· ${p}`).join("\n") +
        `\n\n이 개념들을 먼저 확실히 이해하는 게 이번 페이지의 목표예요. ` +
        `헷갈리는 부분이 있으면 아래에 편하게 질문해 주세요.`,
    );
  }

  const base = [
    "당신은 대학 3학년 '프로그래밍 언어론' 과목의 AI 교수입니다.",
    "학생이 보고 있는 강의 슬라이드(PDF) 한 페이지를 설명/답변합니다.",
    "",
    "== 절대 규칙 (사실 고정) ==",
    "- 아래 '이 페이지의 내용'만을 근거로 설명하세요. 페이지에 없는 내용을 지어내지 마세요.",
    "- 개념의 정확성은 절대 타협하지 않습니다. 페이지에서 확인되지 않으면 단정하지 마세요.",
    "",
    "== 전달 방식 (페르소나) ==",
    persona.style,
    "",
    `== 이 페이지의 내용 (슬라이드 ${page}) ==`,
    text.slice(0, 6000),
  ].join("\n");

  const system =
    mode === "qna"
      ? base +
        "\n\n학생의 질문에 답하세요. 바로 정답을 주기보다 짧은 되물음을 한 번 섞어도 좋지만, 학생이 답답해하면 바로 알려주세요."
      : base +
        "\n\n이 페이지를 2~4문단으로 간결하게 설명하세요. 핵심 개념을 짚고, 학생이 헷갈릴 만한 부분을 미리 풀어주세요.";

  return anthropicTextStream(client, {
    model: mode === "qna" ? MODELS.qna : MODELS.explain,
    max_tokens: 1024,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content:
          mode === "qna" ? String(question ?? "") : "이 페이지를 설명해 주세요.",
      },
    ],
  });
}

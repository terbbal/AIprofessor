import Anthropic from "@anthropic-ai/sdk";

const encoder = new TextEncoder();

/**
 * Anthropic 스트리밍을 브라우저로 흘려보낼 text/plain 스트림으로 변환.
 * 클라이언트는 이 델타를 그대로 받아 타이핑 애니메이션으로 렌더한다.
 */
export function anthropicTextStream(
  client: Anthropic,
  params: Anthropic.MessageStreamParams,
): Response {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const s = client.messages.stream(params);
        s.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
        await s.finalMessage();
        controller.close();
      } catch {
        controller.enqueue(
          encoder.encode(
            "\n\n[오류] 설명을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          ),
        );
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/**
 * API 키가 없을 때 쓰는 목업 스트림. 미리 준비한 텍스트를 한 글자씩 흘려보내
 * "지금 써지는" 느낌을 그대로 재현한다 (키 없이도 데모 가능).
 */
export function mockTextStream(text: string): Response {
  const stream = new ReadableStream({
    async start(controller) {
      for (const ch of text) {
        controller.enqueue(encoder.encode(ch));
        // 타이핑 속도 (ms/char)
        await new Promise((r) => setTimeout(r, 12));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

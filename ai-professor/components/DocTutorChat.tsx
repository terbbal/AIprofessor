"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  page: number;
  pageText: string; // "" = 아직 추출 전
  personaId: string;
}

interface QA {
  question: string;
  answer: string;
}

async function readStream(res: Response, onDelta: (t: string) => void) {
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onDelta(decoder.decode(value, { stream: true }));
  }
}

// 현재 PDF 페이지를 설명하고 질문에 답하는 챗봇 (오른쪽 패널).
export default function DocTutorChat({ page, pageText, personaId }: Props) {
  const [explanation, setExplanation] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [qas, setQas] = useState<QA[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 페이지 텍스트가 준비되면(또는 페르소나가 바뀌면) 설명을 새로 생성.
  useEffect(() => {
    if (!pageText) {
      setExplanation("");
      setQas([]);
      return;
    }
    let cancelled = false;
    setExplanation("");
    setQas([]);
    setExplaining(true);
    (async () => {
      try {
        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "explain", page, pageText, personaId }),
        });
        await readStream(res, (t) => {
          if (!cancelled) setExplanation((prev) => prev + t);
        });
      } finally {
        if (!cancelled) setExplaining(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, pageText, personaId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [explanation, qas]);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || asking) return;
    setQuestion("");
    setAsking(true);
    const idx = qas.length;
    setQas((prev) => [...prev, { question: q, answer: "" }]);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "qna",
          page,
          pageText,
          personaId,
          question: q,
        }),
      });
      await readStream(res, (t) => {
        setQas((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], answer: next[idx].answer + t };
          return next;
        });
      });
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3.5">
        <span className="text-sm font-medium text-zinc-900">AI 교수</span>
        {explaining && (
          <span className="ml-auto text-xs text-zinc-400">설명 작성 중…</span>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto p-5">
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-700">
          {explanation ||
            (pageText ? (
              ""
            ) : (
              <span className="text-zinc-400">페이지를 읽는 중…</span>
            ))}
          {explaining && (
            <span className="ml-0.5 animate-pulse text-zinc-400">▋</span>
          )}
        </div>

        {qas.map((qa, i) => (
          <div key={i} className="space-y-2.5 border-t border-zinc-100 pt-5">
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-zinc-900 px-3.5 py-2 text-sm text-white">
              {qa.question}
            </div>
            <div className="w-fit max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-zinc-100 px-3.5 py-2 text-sm leading-relaxed text-zinc-700">
              {qa.answer || (
                <span className="animate-pulse text-zinc-400">생각 중…</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={ask} className="border-t border-zinc-200 p-3">
        <div className="flex items-center gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="이 페이지에 대해 질문하세요"
            className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:bg-zinc-800 disabled:opacity-30"
          >
            질문
          </button>
        </div>
      </form>
    </div>
  );
}

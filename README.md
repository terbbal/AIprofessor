# 🧑‍🏫 AI 교수 (AI Professor)

**업로드한 강의 슬라이드를 AI 교수가 한 장씩 설명해 주는 웹 앱.**
대학 과목 *CSE307 · 프로그래밍 언어론(Programming Languages)* 을 위해 개발 중입니다.

학생은 실제 강의 슬라이드를 화면으로 보면서, 오른쪽에서 **AI 교수가 그 슬라이드를 실시간으로 타이핑하며 설명**하는 것을 듣고, 궁금한 점은 바로 질문할 수 있습니다.

> 📄 [기획서](AI교수_기획.md) · [3주 개발계획](AI교수_개발계획.md) · [발표자료](AI교수_발표자료.md)

---

## ✨ 핵심 기능

- **📚 챕터 선택** — 교수가 올린 수업 자료가 챕터가 됩니다 (파일명 = 챕터명, 파일명 순 정렬).
- **🖥️ 실제 슬라이드 그대로** — 학습 화면 왼쪽에 업로드한 PDF 슬라이드를 원본 그대로 표시.
- **✍️ 슬라이드별 타이핑 설명** — 오른쪽에서 AI 교수가 현재 슬라이드를 실시간 스트리밍으로 설명.
- **💬 QnA 튜터** — 슬라이드 맥락을 알고 학생 질문에 실시간 답변 (소크라테스식 유도).
- **🎭 교수 페르소나 3종** — 같은 내용을 다른 말투로: *친근한 선배 / 엄격한 노교수 / 다정한 격려형*.
- **📊 진도 관리** — 진행바 + "이해했어요 / 아직 이해 안 돼요" 버튼으로 슬라이드 넘김.
- **🔒 사실/전달 분리** — 슬라이드 "뼈대 노트"가 **사실을 고정**하고, 페르소나는 **말투만** 입힙니다. AI가 없는 개념을 지어내지 못합니다.
- **🧪 API 키 없이도 데모 동작** — 키가 없으면 뼈대 노트를 타이핑으로 흘려보내는 **데모(mock) 모드**로 폴백.

---

## 🚀 실행 방법

앱 코드는 [`ai-professor/`](ai-professor/) 폴더에 있습니다 (Next.js 14).

```bash
cd ai-professor
npm install

# (선택) 실제 AI 설명을 켜려면 API 키 설정 — 없어도 데모 모드로 동작
cp .env.local.example .env.local     # ANTHROPIC_API_KEY 채우기

npm run dev                          # http://localhost:3000
```

브라우저에서 열면 로그인 화면이 나옵니다. 하단 **"샘플 계정으로 바로 로그인"** 의 *학생 · 이학생* 을 누르면 챕터 선택 화면으로 들어갑니다.

---

## 🗂️ 프로젝트 구조

```
AIprofessor/
├─ AI교수_기획.md / 개발계획.md / 발표자료.md   # 기획·계획 문서
└─ ai-professor/                               # Next.js 앱
   ├─ app/
   │  ├─ page.tsx                     # → /login 리다이렉트
   │  ├─ login/page.tsx               # 데모 로그인 (역할 선택)
   │  ├─ student/
   │  │  ├─ page.tsx                  # 학생 홈: 챕터 선택
   │  │  └─ learn/[chapter]/page.tsx  # 학습: 실제 슬라이드(PDF) + AI 교수 타이핑
   │  ├─ professor/                   # 교수: 홈 / 자료 업로드 / 미리보기
   │  └─ api/
   │     ├─ explain/route.ts          # 슬라이드 설명  (Haiku, 스트리밍)
   │     ├─ qna/route.ts              # 질문 답변      (Sonnet, 스트리밍)
   │     └─ upload/route.ts           # 자료 업로드 (원본 파일명 보존)
   ├─ components/                      # SlideViewer · ProfessorChat · PersonaPicker · ProgressBar · RoleGuard …
   ├─ lib/
   │  ├─ anthropic.ts                 # 클라이언트 + 시스템 프롬프트 (서버 전용)
   │  ├─ personas.ts                  # 교수 페르소나 정의
   │  ├─ stream.ts                    # 스트리밍 + 데모 목업 폴백
   │  ├─ auth.ts                      # 데모 로그인 세션 (localStorage)
   │  └─ types.ts
   ├─ data/chapters.ts                # 슬라이드 뼈대 노트 (사실 고정 레이어) + pdfUrl
   └─ public/uploads/                 # 업로드된 수업 자료 (예: lec0.pdf)
```

---

## 🧠 동작 원리 — "사실 고정" 레이어

AI 교수는 아무 PDF나 읽고 즉흥적으로 말하지 않습니다. 각 슬라이드는 코드로 **구조화된 뼈대 노트**(`data/chapters.ts`)를 갖습니다:

```ts
{
  title: "CFG의 정의",
  body: "문맥자유문법 CFG는 4-튜플로 정의된다 …",
  key_facts: ["CFG는 4-튜플 (N, T, P, S)로 정의된다", …],
  common_misconceptions: ["시작 기호 S를 여러 개 둘 수 있다고 오해 …"],
}
```

- **key_facts** 만을 근거로 설명 → 개념 정확성 보장, 환각 방지.
- **common_misconceptions** 를 미리 짚어줌.
- **페르소나** 는 이 사실 위에 *말투* 만 입힘 (정확성·채점 기준은 절대 못 바꿈).

업로드된 PDF는 왼쪽에 **원본 그대로** 보여주고(`pdfUrl`), 오른쪽 설명은 이 뼈대 노트에서 나옵니다.

---

## 🤖 모델 전략 (`lib/anthropic.ts`)

| 작업 | 모델 | 이유 |
|------|------|------|
| 슬라이드 기본 설명 | `claude-haiku-4-5` | 미리 굽기·저비용 |
| QnA 튜터 | `claude-sonnet-5` | 학생 질문에 정확한 실시간 답변 |
| 서술형 채점 (예정) | `claude-opus-4-8` | 정당성이 필요한 채점 |

비용 절감: 고정 시스템 프롬프트(뼈대 노트)에 **프롬프트 캐싱**(`cache_control`) 적용.

---

## 🔐 보안 원칙 (절대 위반 금지)

- `ANTHROPIC_API_KEY` 는 **서버(API 라우트)에서만** 사용. `NEXT_PUBLIC_*` 나 브라우저 코드에 절대 노출하지 않음.
- 모든 Claude 호출은 `app/api/*/route.ts` 를 거침.

---

## 🗺️ 로드맵

- [x] 학생 학습 화면 (슬라이드 + 타이핑 설명 + QnA)
- [x] 교수 페르소나 3종 / 진도바 / 데모 모드
- [x] 챕터 선택 홈 + 업로드 자료(PDF)를 실제 슬라이드로 표시
- [ ] Supabase 인증(로그인) + 학생 레코드
- [ ] 진도/약점/질문 로그 DB 저장 (현재는 로컬 상태)
- [ ] 슬라이드 설명 "미리 굽기" → `base_explanation` 캐시
- [ ] 검증엔진 + 자동 출제·채점 개념 증명

---

<sub>CSE307 Programming Languages · 2026 Spring · DGIST</sub>

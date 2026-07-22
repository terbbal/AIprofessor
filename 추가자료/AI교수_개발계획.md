# AI 교수 프로젝트 — 3주 개발 계획 (상세)

> 프로그래밍 언어론을 가르치고 평가하는 AI 교수 — 웹사이트 배포까지
> 최종 수정: 2026-07-12
> 관련 문서: [기획서](./AI교수_기획.md)

---

## 0. 이 문서의 목표

3주 안에 **"슬라이드 강의 + QnA 튜터가 실제로 돌아가는 배포된 웹사이트"** 를 만든다.
평가(출제·채점)는 3주차에 **개념 증명(1문제)** 수준까지만. 나머지는 MVP 이후 확장.

**완성 기준(Definition of Done):**
- [ ] 인터넷에서 접속 가능한 URL이 존재한다 (Vercel 배포)
- [ ] 학생이 로그인해서 슬라이드를 넘기며 실시간 설명을 받는다
- [ ] 학생이 질문하면 AI가 슬라이드 맥락을 알고 답한다
- [ ] 교수 페르소나를 학생이 고를 수 있다
- [ ] 진도·약점이 DB에 저장된다
- [ ] CFG 문제 1개를 자동 채점하는 데모가 있다

---

## 1. 사전 준비물 (개발 시작 전)

### 1.1 계정·키 발급
- [ ] **Anthropic API 키** — console.anthropic.com → API Keys. 결제 수단 등록(선불 크레딧 $5~10로 시작 충분)
- [ ] **Vercel 계정** — GitHub 로그인. 무료 티어
- [ ] **Supabase 계정** — DB + 인증. 무료 티어
- [ ] **GitHub 저장소** — 코드 버전관리 + Vercel 자동배포 연결

### 1.2 로컬 개발 환경
- [ ] Node.js 20 LTS 이상 설치 (`node --version`으로 확인)
- [ ] 코드 에디터 (VS Code 권장)
- [ ] Git 설치

### 1.3 ⭐ 수업자료 (가장 중요 — 당신의 핵심 준비물)
AI 교수의 품질은 이 자료 품질에 정비례한다. 아래 형식으로 준비:

**(a) 슬라이드 원본** — PDF 또는 이미지(PNG). 챕터별 폴더로 정리.

**(b) 슬라이드별 "뼈대 노트"** — 각 슬라이드마다 **반드시 정확히 전달해야 할 핵심**을 미리 확정.
JSON 형식 예시:
```json
{
  "chapter": 3,
  "slide": 12,
  "title": "문맥자유문법(CFG)의 정의",
  "image": "ch3/slide12.png",
  "key_facts": [
    "CFG는 4-튜플 (N, T, P, S)로 정의된다",
    "N = 비단말 기호 집합",
    "T = 단말 기호 집합",
    "P = 생성 규칙 집합",
    "S = 시작 기호 (S ∈ N)"
  ],
  "common_misconceptions": [
    "S를 여러 개 둘 수 있다고 오해 (시작 기호는 단 하나)"
  ],
  "prerequisites": ["BNF 표기법(슬라이드 3)"]
}
```
> 이 뼈대 노트가 "사실 고정" 레이어다. AI는 이걸 벗어난 개념을 지어내지 못한다.

**(c) 최소 분량** — MVP는 **1개 챕터(약 20~40 슬라이드)** 면 충분. 전체를 다 준비하지 말 것.

---

## 2. 기술 스택 (선택 이유 포함)

| 계층 | 기술 | 이유 |
|------|------|------|
| 프레임워크 | **Next.js 14 (App Router)** | 프론트+백엔드 한 몸. API 라우트에서 Claude 안전 호출 |
| 배포 | **Vercel** | `git push` → 자동 배포. Next.js 최적 |
| DB + 인증 | **Supabase** (Postgres) | 무료, 로그인·DB·저장소 한 번에 |
| LLM SDK | **@anthropic-ai/sdk** | 공식 SDK, 스트리밍 지원(타이핑 효과 핵심) |
| 스타일 | **Tailwind CSS** | 빠른 UI 개발 |
| 파서(검증엔진) | **nearley.js** 또는 자체 CFG 검사기 | CFG/파스트리 자동 판정 |

### 2.1 ⚠️ 보안 원칙 (절대 위반 금지)
- **Anthropic API 키는 서버(API 라우트)에서만** 사용. 브라우저 코드/`NEXT_PUBLIC_*` 환경변수에 **절대** 넣지 않는다.
- 키는 `.env.local`(로컬) + Vercel 환경변수(배포)에 저장. `.gitignore`에 `.env*` 포함.
- 모든 Claude 호출은 `app/api/*/route.ts`를 거친다. 클라이언트는 자기 API 라우트만 호출.

---

## 3. 모델 전략 (작업별 등급 분리)

| 작업 | 모델 | 모델 ID | 가격(입/출 per 1M) | 언제 |
|------|------|---------|-------------------|------|
| 슬라이드 기본 설명 | **Haiku 4.5** | `claude-haiku-4-5` | $1 / $5 | 미리 생성 or 저렴하게 |
| QnA 튜터 | **Sonnet 5** | `claude-sonnet-5` | $3 / $15 | 학생이 실제 질문할 때만 |
| 서술형 채점 | **Opus 4.8** | `claude-opus-4-8` | $5 / $25 | 정당성 필요한 채점만 |

### 3.1 비용 절감 3대 기법 (코드에 반드시 반영)
1. **미리 굽기** — 슬라이드 기본 설명은 준비 단계에서 한 번 생성해 DB에 저장. 실시간 생성 아님.
2. **타이핑 애니메이션 = 스트리밍** — 저장된 설명도 SDK 스트리밍으로 한 글자씩 흘려보내 "지금 써지는" 느낌.
3. **프롬프트 캐싱** — 시스템 프롬프트·뼈대 노트에 `cache_control: {type: "ephemeral"}` → 반복 호출 입력비 최대 90% 절감.

### 3.2 스트리밍 코드 골격 (참고)
```ts
// app/api/explain/route.ts (서버 전용)
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic(); // ANTHROPIC_API_KEY 환경변수 자동 사용

export async function POST(req: Request) {
  const { slideNote, studentContext } = await req.json();
  const stream = client.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: [{
      type: "text",
      text: SYSTEM_PROMPT + JSON.stringify(slideNote),
      cache_control: { type: "ephemeral" }, // 고정 부분 캐싱
    }],
    messages: [{ role: "user", content: studentContext }],
  });
  return new Response(stream.toReadableStream()); // 브라우저로 스트리밍
}
```

---

## 4. 프로젝트 폴더 구조 (목표)

```
ai-professor/
├── app/
│   ├── page.tsx                 # 랜딩 / 로그인
│   ├── learn/
│   │   └── [chapter]/page.tsx   # 슬라이드 학습 화면
│   ├── quiz/page.tsx            # 평가(3주차)
│   └── api/
│       ├── explain/route.ts     # 슬라이드 설명 (Haiku, 스트리밍)
│       ├── qna/route.ts         # 질문 답변 (Sonnet)
│       ├── grade/route.ts       # 채점 (Opus, 3주차)
│       └── verify/route.ts      # 검증엔진: CFG 파싱 (3주차)
├── components/
│   ├── SlideViewer.tsx          # 왼쪽 슬라이드
│   ├── ProfessorChat.tsx        # 오른쪽 실시간 설명 + 챗
│   ├── PersonaPicker.tsx        # 페르소나 선택
│   └── ProgressBar.tsx          # 진도바
├── lib/
│   ├── anthropic.ts             # 클라이언트 초기화
│   ├── personas.ts              # 페르소나 프롬프트 정의
│   ├── supabase.ts              # DB 클라이언트
│   └── parser.ts                # CFG 검증 로직 (3주차)
├── data/
│   └── chapters/                # 슬라이드 이미지 + 뼈대 노트 JSON
├── .env.local                   # API 키 (git 제외!)
└── package.json
```

---

## 5. 데이터베이스 스키마 (Supabase)

```sql
-- 학생
create table students (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  persona text default 'friendly_senior',  -- 선택한 페르소나
  created_at timestamptz default now()
);

-- 슬라이드 뼈대 노트 (준비 자료 적재)
create table slides (
  id serial primary key,
  chapter int,
  slide_no int,
  title text,
  image_path text,
  key_facts jsonb,
  misconceptions jsonb,
  base_explanation text,       -- 미리 구운 기본 설명
  unique(chapter, slide_no)
);

-- 학습 진도 / 약점 추적
create table progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id),
  slide_id int references slides(id),
  understood boolean,          -- '이해했어요' true / '안 돼요' false
  time_spent_sec int,
  created_at timestamptz default now()
);

-- 질문 로그 (약점 데이터 원천)
create table questions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id),
  slide_id int references slides(id),
  question text,
  answer text,
  created_at timestamptz default now()
);
```

---

## 6. 주차별 · 일자별 상세 계획

> 하루 = 실작업 3~5시간 가정. 상황 따라 밀리면 "완성 기준"만 사수.

### 🗓️ Week 1 — 기반 + 슬라이드 실시간 강의

**Day 1 — 프로젝트 뼈대 + 첫 배포**
- [ ] `npx create-next-app@latest ai-professor` (TypeScript, Tailwind, App Router 선택)
- [ ] GitHub 저장소 연결, 첫 커밋
- [ ] Vercel에 저장소 연결 → "Hello World"가 인터넷에서 열리는지 확인
- [ ] `.gitignore`에 `.env*` 확인, `.env.local`에 `ANTHROPIC_API_KEY` 넣기

**Day 2 — Claude 스트리밍 연동**
- [ ] `npm i @anthropic-ai/sdk`
- [ ] `app/api/explain/route.ts` 작성 → Haiku로 스트리밍 응답
- [ ] 임시 페이지에서 "타이핑되며 나타나는지" 확인 (인코딩·스트리밍 검증)

**Day 3 — 수업자료 적재**
- [ ] 1개 챕터 슬라이드 이미지를 `data/chapters/`에 넣기
- [ ] 뼈대 노트 JSON 작성 (섹션 1.3 형식)
- [ ] Supabase `slides` 테이블 생성 + 뼈대 노트 적재 스크립트
- [ ] "미리 굽기": 각 슬라이드 기본 설명을 Haiku로 1회 생성 → `base_explanation`에 저장

**Day 4 — 학습 화면 UI**
- [ ] `SlideViewer` (왼쪽) + `ProfessorChat` (오른쪽) + `ProgressBar` 레이아웃
- [ ] 슬라이드 넘기기(이전/다음) 동작
- [ ] 슬라이드 바뀌면 저장된 설명을 스트리밍(타이핑)으로 표시

**Day 5 — 다듬기 + 배포**
- [ ] "이해했어요 / 안 돼요" 버튼 (동작은 다음 주에 저장 연결)
- [ ] 반응형·스타일 정리
- [ ] Vercel 배포 → **1주차 완성 기준 확인**

> **Week 1 완성 기준:** 배포된 사이트에서 슬라이드를 넘기면 오른쪽에 설명이 타이핑된다.

---

### 🗓️ Week 2 — QnA 튜터 + 페르소나 + 데이터

**Day 6 — 인증(로그인)**
- [ ] Supabase Auth 연동 (이메일 매직링크 or Google)
- [ ] 로그인한 학생만 학습 화면 접근
- [ ] `students` 레코드 생성

**Day 7 — QnA 튜터**
- [ ] `app/api/qna/route.ts` (Sonnet 5, 스트리밍)
- [ ] `ProfessorChat`에 질문 입력창 → 답변 스트리밍
- [ ] 프롬프트에 **현재 슬라이드 + 앞 슬라이드 맥락** 포함 (맥락 유지)
- [ ] 질문·답변을 `questions` 테이블에 저장

**Day 8 — 진도·약점 저장**
- [ ] "이해/안 돼요" 클릭 → `progress` 테이블 저장
- [ ] 슬라이드 체류 시간 측정·저장
- [ ] 간단한 "내 진도" 표시 (몇 %, 어디서 막혔나)

**Day 9 — 페르소나 시스템**
- [ ] `lib/personas.ts`에 3종 정의 (친근한 선배 / 엄격한 노교수 / 다정한 격려형)
- [ ] `PersonaPicker` UI → 선택 시 `students.persona` 저장
- [ ] 설명·QnA 프롬프트에 선택된 페르소나 말투 주입
- [ ] ⚠️ 페르소나는 **말투만** 바꾸고 뼈대 노트(사실)는 고정 — 검증

**Day 10 — 개인화 델타 + 다듬기**
- [ ] 설명 앞에 "아까 N번에서 헷갈려하셨죠" 같은 개인화 한 문장 실시간 생성(소량)
- [ ] 버그 잡기, 배포 → **2주차 완성 기준 확인**

> **Week 2 완성 기준:** 학생이 로그인해 페르소나를 고르고, 자기 페이스로 배우며 질문하고, 진도가 저장된다.

---

### 🗓️ Week 3 — 평가 개념 증명 + 완성

**Day 11 — 검증엔진 (핵심 기능 축소판)**
- [ ] `lib/parser.ts` — CFG 문법으로 문자열 생성/파싱 판정 로직
- [ ] 문제 유형 **1개만** 선택 (예: "이 CFG가 문자열 X를 생성하는가?" O/X)
- [ ] `app/api/verify/route.ts` — 학생 답을 실제 파싱해 정오 판정

**Day 12 — 출제**
- [ ] 뼈대 노트 기반으로 Opus가 CFG 문제 1개 생성 (출처 슬라이드 명시)
- [ ] 검증엔진으로 "정답이 유일한지" 자체 검증
- [ ] `quiz/page.tsx`에 문제 표시 + 답 입력

**Day 13 — 채점 + 피드백**
- [ ] 자동검증형: 검증엔진이 즉시 O/X + 근거
- [ ] 서술형 1문제: `app/api/grade/route.ts` (Opus) — 루브릭 기반 채점 + 점수별 근거 문장
- [ ] "왜 이 점수인지" 학생에게 표시

**Day 14 — 통합·다듬기**
- [ ] 전체 흐름 연결: 로그인 → 학습 → 평가 → 피드백
- [ ] UI 정리, 에러 처리, 로딩 상태
- [ ] 도메인 연결(선택), 최종 배포

**Day 15 — 리뷰 + 문서화**
- [ ] 직접 학생처럼 한 챕터 완주 테스트
- [ ] 비용 실측 (Anthropic 콘솔에서 토큰 사용량 확인)
- [ ] README 작성, 데모 영상/스크린샷

> **Week 3 완성 기준:** 가르치고 → 평가하는 한 사이클이 배포된 사이트에서 돌아간다.

---

## 7. 비용 추정 (감 잡기용)

가정: 학생 1명이 40슬라이드 챕터 1개 학습 + 질문 10회.

| 항목 | 대략 |
|------|------|
| 슬라이드 설명(미리 굽기, Haiku) | 40회 × 소량 = 몇 센트 (1회성, 캐시) |
| 실시간 타이핑 재생 | **$0** (저장된 텍스트 재생) |
| QnA 10회 (Sonnet) | 수 센트 |
| 채점 몇 건 (Opus) | 수 센트 |

> **핵심:** 미리 굽기 + 캐싱 + 타이핑 재생 덕분에, 학생 수가 늘어도 비용이 선형으로 폭증하지 않는다. 실시간 토큰은 "진짜 상호작용"에만 발생.
> 개발/테스트 단계 총비용은 **$5~10 크레딧으로 충분**.

---

## 8. 리스크 & 스코프 관리

| 리스크 | 대응 |
|--------|------|
| 검증엔진이 3주에 안 끝남 | 문제 유형 1개로 축소. 나머지는 MVP 이후 |
| 수업자료 준비 지연 | 1개 챕터만. 완벽하지 않아도 시작 |
| 슬라이드 이미지 속 그림/수식 해석 부정확 | 뼈대 노트에 텍스트로 명시(멀티모달 의존 최소화) |
| 스트리밍/인코딩 이슈 | Day 2에 먼저 검증하고 넘어감 |
| 비용 초과 | 대시보드 모니터링, Haiku 최대 활용 |

**황금 규칙:** 막히면 "완성 기준"만 사수하고 나머지는 과감히 미룬다.

---

## 9. MVP 이후 로드맵 (참고)

- [ ] 검증엔진 확장: 파스트리 그리기, 모호성 제거 등 문제 유형 추가
- [ ] 여러 챕터 / 전체 커리큘럼
- [ ] 오프라인 시험 답안 디지털화 (OCR / 태블릿 입력)
- [ ] 이의제기(재채점) 흐름
- [ ] 교수용 대시보드 ("12번 슬라이드 80% 막힘" 리포트)
- [ ] 여러 반 / 다중 교수 관리
- [ ] 부정행위 방지 정교화

---

## 10. 다음 액션

- [ ] **오늘**: 섹션 1의 계정·키 발급 + 1개 챕터 슬라이드/뼈대 노트 준비 시작
- [ ] **Day 1**: `create-next-app` → Vercel 첫 배포
- [ ] 막히는 지점은 이 문서 섹션 번호로 표시해 질문

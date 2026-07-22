# 🧑‍🏫 AI 교수 — 프로그래밍 언어론

슬라이드 기반으로 살아있는 강의를 하고, QnA 튜터로 답하는 AI 교수.
([기획서](../AI교수_기획.md) · [3주 개발계획](../AI교수_개발계획.md))

## 지금까지 구현된 것 (Week 1~2 핵심)

- ✅ 슬라이드 학습 화면: 넘기면 오른쪽에서 설명이 **타이핑 스트리밍**으로 나타남
- ✅ QnA 튜터: 슬라이드 맥락(현재+앞 슬라이드)을 알고 실시간 답변 (소크라테스식 유도)
- ✅ 교수 페르소나 3종 선택 (친근한 선배 / 엄격한 노교수 / 다정한 격려형)
- ✅ 진도바 + "이해했어요 / 아직 이해 안 돼요" 버튼
- ✅ **사실/전달 분리**: 뼈대 노트(`data/chapters.ts`)가 사실 고정, 페르소나가 말투만 입힘
- ✅ 비용 전략: 프롬프트 캐싱(`cache_control`) + 작업별 모델 분리(Haiku/Sonnet)
- ✅ **API 키 없이도 데모 동작** (목업 스트리밍 폴백)

## 실행

```bash
npm install
cp .env.local.example .env.local   # ANTHROPIC_API_KEY 채우기 (없어도 데모 모드로 동작)
npm run dev                        # http://localhost:3000
```

## 구조

```
app/
  page.tsx                 # 랜딩 (챕터 목록 + 페르소나 소개)
  learn/[chapter]/page.tsx # 슬라이드 학습 화면
  api/
    explain/route.ts       # 슬라이드 설명 (Haiku, 스트리밍)
    qna/route.ts           # 질문 답변 (Sonnet, 스트리밍)
components/                # SlideViewer / ProfessorChat / PersonaPicker / ProgressBar
lib/
  anthropic.ts             # 클라이언트 + 시스템 프롬프트 (서버 전용)
  personas.ts              # 페르소나 정의
  stream.ts                # 스트리밍 + 목업 폴백
  types.ts
data/chapters.ts           # 슬라이드 뼈대 노트 (사실 고정 레이어)
```

## 모델 전략 (`lib/anthropic.ts`)

| 작업 | 모델 |
|------|------|
| 슬라이드 기본 설명 | `claude-haiku-4-5` |
| QnA 튜터 | `claude-sonnet-5` |
| 서술형 채점 (3주차) | `claude-opus-4-8` |

## 보안 원칙 (절대 위반 금지)

- `ANTHROPIC_API_KEY`는 **서버(API 라우트)에서만** 사용. `NEXT_PUBLIC_*`/브라우저 코드에 절대 넣지 않음.
- 모든 Claude 호출은 `app/api/*/route.ts`를 거침.

## 다음 단계 (개발계획 기준)

- [ ] Supabase 인증(로그인) + `students` 레코드
- [ ] 진도/약점/질문 로그를 DB에 저장 (현재는 로컬 상태)
- [ ] 슬라이드 기본 설명 "미리 굽기" → `base_explanation` 캐시
- [ ] Week 3: 검증엔진(CFG 파싱) + 출제 + 채점 개념 증명

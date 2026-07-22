# 🧑‍🏫 AI 교수 — 프로그래밍 언어론

슬라이드 기반으로 살아있는 강의를 하고, QnA 튜터로 답하는 AI 교수.
([기획서](../AI교수_기획.md) · [3주 개발계획](../AI교수_개발계획.md))

> 📖 프로젝트 전체 소개는 [루트 README](../README.md) 를 참고하세요. 이 문서는 앱 개발용 요약입니다.

## 지금까지 구현된 것

- ✅ 데모 로그인 + 역할 가드 (학생 / 교수)
- ✅ 학생 홈: 업로드 자료 기반 **챕터 선택** 화면 (파일명 순 정렬)
- ✅ 학습 화면: 왼쪽 **실제 슬라이드(PDF)** + 오른쪽 AI 교수 **타이핑 스트리밍** 설명
- ✅ QnA 튜터: 슬라이드 맥락을 알고 실시간 답변 (소크라테스식 유도)
- ✅ 교수 페르소나 3종 (친근한 선배 / 엄격한 노교수 / 다정한 격려형)
- ✅ 진도바 + "이해했어요 / 아직 이해 안 돼요" 버튼
- ✅ 교수 자료 업로드 (원본 파일명 보존)
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
  page.tsx                      # → /login 리다이렉트
  login/page.tsx                # 데모 로그인 (역할 선택)
  student/
    page.tsx                    # 학생 홈: 챕터 선택
    learn/[chapter]/page.tsx    # 학습: 실제 슬라이드(PDF iframe) + AI 교수 타이핑
  professor/                    # 교수: 홈 / upload / preview
  api/
    explain/route.ts            # 슬라이드 설명 (Haiku, 스트리밍)
    qna/route.ts                # 질문 답변 (Sonnet, 스트리밍)
    upload/route.ts             # 자료 업로드 (원본 파일명 보존)
components/                     # SlideViewer · ProfessorChat · PersonaPicker · ProgressBar · RoleGuard · PdfLearn …
lib/
  anthropic.ts                  # 클라이언트 + 시스템 프롬프트 (서버 전용)
  auth.ts                       # 데모 로그인 세션 (localStorage)
  personas.ts                   # 페르소나 정의
  stream.ts                     # 스트리밍 + 목업 폴백
  types.ts
data/chapters.ts                # 슬라이드 뼈대 노트 (사실 고정 레이어) + pdfUrl
public/uploads/                 # 업로드된 수업 자료 (예: lec0.pdf)
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

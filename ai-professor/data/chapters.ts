import { Chapter } from "@/lib/types";

// 업로드된 수업 자료(교수 PDF)를 슬라이드별 "뼈대 노트"로 변환한 챕터.
// 원본: public/uploads/lec0(1).pdf (CSE307 Programming Languages, Lecture 0)
const lec0: Chapter = {
  id: "lec0",
  chapter: 0,
  title: "Lecture 0 · 강의 개요 (Course Overview)",
  pdfUrl: "/uploads/lec0.pdf",
  slidesDir: "/uploads/lec0",
  slides: [
    {
      chapter: 0,
      slide: 1,
      title: "CSE307 · 프로그래밍 언어론 소개",
      body: "CSE307: Programming Languages\n담당: Minseok Jeon (DGIST EECS)\n2026 Spring, Lecture 0 — 강의 개요",
      key_facts: [
        "과목명: CSE307 Programming Languages (프로그래밍 언어론)",
        "이 강의(Lecture 0)는 학기 전체를 안내하는 개요(overview) 시간이다",
      ],
    },
    {
      chapter: 0,
      slide: 2,
      title: "기본 정보",
      body: "담당 교수, 조교, 강의자료 배포 경로 안내.",
      key_facts: [
        "담당 교수: Minseok Jeon (DGIST EECS 조교수, 전공: Programming Languages)",
        "연구실 211 E7, 이메일 minseok_jeon@dgist.ac.kr, 오피스아워: 월 09:00–11:59 (사전 약속)",
        "조교(TA): Sanggyu Oh (sg549@dgist.ac.kr)",
        "강의 슬라이드는 LMS와 https://dgistpl.github.io/courses/cse307/2026/ 에 업로드된다",
      ],
    },
    {
      chapter: 0,
      slide: 3,
      title: "이 수업이 아닌 것",
      body: "이 과목은 프로그래밍 입문 강의가 아니다.",
      key_facts: [
        "특정 프로그래밍 언어(문법) 자체를 배우는 수업이 아니다",
        "그 언어들로 프로그램을 '작성하는 법'을 배우는 수업도 아니다",
      ],
      common_misconceptions: [
        "'프로그래밍 언어론'을 새 언어의 문법을 외우는 과목으로 오해 — 목표는 언어를 '설계·구현·분석'하는 원리를 배우는 것",
      ],
    },
    {
      chapter: 0,
      slide: 4,
      title: "이 수업에서 배우는 것 · 선수 요건",
      body: "언어가 어떻게 설계·구현되는지, 그 근본 원리를 형식적으로 사고하는 법을 배운다.",
      key_facts: [
        "배우는 것: 프로그래밍 언어가 어떻게 설계·구현되는가, 현대 언어의 근본 원리, 형식적·엄밀한 사고",
        "선수 요건: 기본 프로그래밍 능력, 최소 2개 언어(C·Java 등) 경험, 계산이론·이산수학 등 수강",
        "새로운 것을 배울 준비가 되어 있어야 한다",
      ],
    },
    {
      chapter: 0,
      slide: 5,
      title: "언어의 설계와 구현",
      body: "직접 프로그래밍 언어 시스템을 설계·구현하며 개념을 익힌다.\n\nlet x = read in\nletrec fact(n) =\n  if iszero n then 1\n  else ((fact (n-1)) * n)\nin (fact x)",
      key_facts: [
        "우리만의 프로그래밍 언어를 직접 정의한다 (예: factorial 프로그램)",
        "그 언어의 인터프리터(Interpreter)를 설계·구현한다: Program → Interpreter → Result",
        "그 언어의 타입 검사기(Type Checker)를 설계·구현한다: Program → Type Checker → Safe/Unsafe",
      ],
    },
    {
      chapter: 0,
      slide: 6,
      title: "바라는 성취",
      body: "학기가 끝나면 스스로 언어를 만들 수 있게 되는 것을 목표로 한다.",
      key_facts: [
        "자신의 문제를 해결하기 위한 프로그래밍 언어를 개발할 수 있게 된다",
        "특정 문제(자기 문제)를 풀기 위한 언어를 설계할 수 있게 된다",
        "프로그래밍 언어는 '사용하는 도구'일 뿐 아니라 '직접 만들어 쓰는 도구'라는 관점을 갖는다",
      ],
    },
    {
      chapter: 0,
      slide: 7,
      title: "함수형 프로그래밍",
      body: "이 수업의 두 번째 목표는 함수형 프로그래밍에 익숙해지는 것이다.",
      key_facts: [
        "함수형 프로그래밍은 side effect 대신 순수 함수(pure function) 사용을 권장한다",
        "Python, JavaScript, C++, Java8, Scala, Go 등 현대 언어가 채택한 주요 패러다임 중 하나다",
        "이 수업에서는 OCaml로 함수형 프로그래밍을 배우고, 이를 이용해 언어를 구현한다",
      ],
    },
    {
      chapter: 0,
      slide: 8,
      title: "다루는 주제",
      body: "학기 내용은 크게 세 부분으로 구성된다.",
      key_facts: [
        "Part 1 (기초): 귀납적 정의, 함수형 프로그래밍 기초, 재귀·고차 프로그래밍",
        "Part 2 (기본 개념): 구문(syntax), 의미(semantics), 이름·바인딩·스코프, 환경, 인터프리터, 상태·부수효과, store·reference, 가변 변수, 파라미터 전달",
        "Part 3 (심화): 타입 시스템, 타이핑 규칙, 타입 검사, 건전성/완전성, 자동 타입 추론, 다형 타입 시스템, 람다 계산법, 프로그램 합성",
      ],
    },
    {
      chapter: 0,
      slide: 9,
      title: "강의 자료",
      body: "슬라이드와 교재 안내.",
      key_facts: [
        "자체 완결형(self-contained) 슬라이드가 제공된다",
        "매 수업 출석이 요구된다 (빠지면 따라잡기 어렵다)",
        "주교재: Hakjoo Oh, Introduction to Principles of Programming Languages (PDF 제공)",
        "참고서: Essentials of Programming Languages (3rd Ed.), Friedman & Wand, MIT Press",
      ],
    },
    {
      chapter: 0,
      slide: 10,
      title: "성적 평가",
      body: "평가 비중.",
      key_facts: [
        "출석 및 참여 10%",
        "과제(Homework) 10%",
        "중간고사 40%",
        "기말고사 40%",
      ],
    },
    {
      chapter: 0,
      slide: 11,
      title: "ML로 프로그래밍하기",
      body: "ML은 프로그래밍 언어 연구의 핵심 성과를 반영한 범용 언어다. 이 수업에서는 ML의 방언인 OCaml을 사용한다.",
      key_facts: [
        "ML의 특징: 고차 함수, 정적 타이핑과 자동 타입 추론, 매개변수 다형성, 대수적 자료형과 패턴 매칭, 자동 가비지 컬렉션",
        "ML은 C#, F#, Scala, Java, JavaScript, Haskell, Rust 등 현대 언어 설계에 영향을 주었다",
        "이 수업에서는 ML의 프랑스 방언인 OCaml(http://ocaml.org)을 사용한다",
      ],
    },
    {
      chapter: 0,
      slide: 12,
      title: "질문",
      body: "여기까지 강의 개요에 대한 질문을 받는 시간이다. 궁금한 점은 오른쪽 질문창으로 물어보세요.",
      key_facts: [
        "강의 개요(운영·목표·평가)에 대해 자유롭게 질문할 수 있다",
      ],
    },
    {
      chapter: 0,
      slide: 13,
      title: "특별 프로젝트 (1) — 목표와 과제",
      body: "선택 참여형 오픈 프로젝트: 'AI에 강하지만 사람에게는 친화적인' 프로그래밍 언어 설계.",
      key_facts: [
        "프로젝트 목표: AI-resistant(AI가 풀기 어려움)하면서 human-friendly한 프로그래밍 언어를 설계한다",
        "배경: 기존 AI(ChatGPT, Claude 등)가 일반 언어의 과제를 쉽게 풀어 학습·학문적 진실성을 해친다",
        "과제: AI는 올바른 해를 작성하기 어렵지만 사람은 효과적으로 풀 수 있는 새 언어를 설계 (구문·의미·비관습적 패러다임 고려)",
        "산출물: 언어 명세(specification) + 설계 선택에 대한 정당화. 열린 연구 프로젝트다",
      ],
    },
    {
      chapter: 0,
      slide: 14,
      title: "특별 프로젝트 (2) — 보상과 참여",
      body: "성공적인 설계에는 가산점이 주어지는 선택 프로젝트.",
      key_facts: [
        "보상: 그런 언어를 성공적으로 설계한 학생은 기말 성적에서 가산점을 받는다",
        "참여 방법: 도전하고 싶으면 담당 교수(minseok_jeon@dgist.ac.kr)에게 이메일로 신청한다",
      ],
    },
  ],
};

// MVP: 문맥자유문법 챕터 (샘플 개념 데이터). 뼈대 노트 = 사실 고정 레이어.
// 실제 배포 시 이 데이터를 Supabase `slides` 테이블에 적재한다.

const ch3: Chapter = {
  id: "cfg",
  chapter: 3,
  title: "문맥자유문법 (Context-Free Grammar)",
  slides: [
    {
      chapter: 3,
      slide: 1,
      title: "형식 문법이 필요한 이유",
      body: "자연어의 모호함 없이 프로그래밍 언어의 구조를 '규칙'으로 못 박기 위해 형식 문법을 쓴다.\n\n예) if 문, 산술식, 함수 정의의 올바른 형태를 기계가 판별할 수 있어야 한다.",
      key_facts: [
        "형식 문법은 언어에 속하는 문자열의 집합을 유한한 규칙으로 정의한다",
        "컴파일러의 구문 분석(파싱) 단계가 이 규칙에 기반한다",
      ],
      common_misconceptions: [
        "문법이 '의미'까지 정의한다고 오해 (문법은 구조/구문만 정의, 의미론은 별개)",
      ],
    },
    {
      chapter: 3,
      slide: 2,
      title: "BNF 표기법",
      body: "BNF(Backus–Naur Form)는 생성 규칙을 적는 표준 표기법이다.\n\n<expr> ::= <expr> + <term> | <term>\n<term> ::= <term> * <factor> | <factor>\n<factor> ::= ( <expr> ) | id",
      key_facts: [
        "::= 는 '~로 정의된다'를 뜻한다",
        "| 는 대안(또는)을 뜻한다",
        "< > 로 감싼 것은 비단말 기호",
      ],
      common_misconceptions: [
        "::= 를 프로그래밍의 대입(=)과 혼동",
      ],
      prerequisites: ["형식 문법의 필요성(슬라이드 1)"],
    },
    {
      chapter: 3,
      slide: 3,
      title: "CFG의 정의",
      body: "문맥자유문법 CFG는 4-튜플로 정의된다:\n\n    G = (N, T, P, S)",
      key_facts: [
        "CFG는 4-튜플 (N, T, P, S)로 정의된다",
        "N = 비단말 기호(nonterminal) 집합",
        "T = 단말 기호(terminal) 집합",
        "P = 생성 규칙(production) 집합",
        "S = 시작 기호 (S ∈ N)",
      ],
      common_misconceptions: [
        "시작 기호 S를 여러 개 둘 수 있다고 오해 — 시작 기호는 단 하나다",
        "N과 T가 겹칠 수 있다고 오해 — N ∩ T = ∅ (서로소)",
      ],
      prerequisites: ["BNF 표기법(슬라이드 2)"],
    },
    {
      chapter: 3,
      slide: 4,
      title: "생성 규칙과 유도(derivation)",
      body: "생성 규칙의 왼쪽(비단말)을 오른쪽으로 바꿔 나가는 과정을 유도라 한다.\n\nS ⇒ S + S ⇒ id + S ⇒ id + id",
      key_facts: [
        "CFG에서 규칙의 왼쪽은 항상 '단 하나의 비단말'이다 (이것이 '문맥자유'의 핵심)",
        "유도는 시작 기호 S에서 출발해 단말 기호 열에 도달한다",
        "⇒ 는 '한 단계 유도'를 뜻한다",
      ],
      common_misconceptions: [
        "규칙 왼쪽에 단말이나 여러 기호가 올 수 있다고 오해 — 그러면 문맥자유가 아니다",
      ],
      prerequisites: ["CFG의 정의(슬라이드 3)"],
    },
    {
      chapter: 3,
      slide: 5,
      title: "파스 트리",
      body: "유도 과정을 트리로 나타낸 것이 파스 트리다. 루트=시작기호, 잎=단말 기호.\n\n        S\n      / | \\\n     S  +  S\n     |     |\n    id    id",
      key_facts: [
        "파스 트리의 루트는 시작 기호 S",
        "파스 트리의 잎(leaf)들을 왼쪽→오른쪽으로 읽으면 유도된 문자열",
        "내부 노드는 비단말, 잎은 단말",
      ],
      common_misconceptions: [
        "파스 트리와 유도 순서를 동일시 — 여러 유도가 같은 파스 트리를 만들 수 있다",
      ],
      prerequisites: ["유도(슬라이드 4)"],
    },
    {
      chapter: 3,
      slide: 6,
      title: "모호성(ambiguity)",
      body: "한 문자열에 대해 서로 다른 파스 트리가 둘 이상 존재하면 그 문법은 모호하다.\n\nid + id * id 는 (id+id)*id 와 id+(id*id) 두 트리를 가질 수 있다.",
      key_facts: [
        "모호한 문법 = 어떤 문자열이 2개 이상의 서로 다른 파스 트리를 갖는 문법",
        "모호성은 문법의 성질이지 문자열 하나의 성질이 아니다",
        "연산자 우선순위/결합성을 문법에 반영하면 모호성을 제거할 수 있다",
      ],
      common_misconceptions: [
        "유도가 2개면 무조건 모호하다고 오해 — 파스 트리가 2개여야 모호하다",
      ],
      prerequisites: ["파스 트리(슬라이드 5)"],
    },
  ],
};

// 코드에 내장된(hand-authored) 정적 챕터들. 업로드 챕터는 chapters.json 에서 별도로 병합된다.
// (병합·조회는 서버 전용 lib/chapterStore.ts 가 담당)
export const staticChapters: Chapter[] = [lec0, ch3];

export function getStaticChapterById(id: string): Chapter | undefined {
  return staticChapters.find((c) => c.id === id);
}

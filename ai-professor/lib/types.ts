// 공통 타입 정의

/** 슬라이드의 "뼈대 노트" — 사실 고정 레이어. AI는 이걸 벗어난 개념을 지어내지 못한다. */
export interface SlideNote {
  chapter?: number;
  slide: number;
  title: string;
  /** 슬라이드에 표시할 핵심 내용(텍스트/수식). 이미지 대신 텍스트로 명시해 멀티모달 의존 최소화. */
  body: string;
  /** 반드시 정확히 전달해야 할 핵심 사실들 */
  key_facts: string[];
  /** 흔한 오개념 (설명 시 미리 짚어줄 것) */
  common_misconceptions?: string[];
  /** 선행 개념 (앞 슬라이드 참조) */
  prerequisites?: string[];
}

export interface Chapter {
  /** 라우팅·식별용 슬러그 (예: "lec0", "cfg"). 업로드 챕터는 파일명에서 생성. */
  id: string;
  title: string;
  slides: SlideNote[];
  /** (표시용) 챕터 번호. 없어도 됨. */
  chapter?: number;
  /** 업로드된 원본 자료(PDF) 경로. 있으면 학습 화면 왼쪽에 실제 슬라이드를 그대로 띄운다.
   *  슬라이드 번호(slide) = PDF 페이지 번호로 매핑한다. */
  pdfUrl?: string;
  /** 페이지별로 분할한 1장짜리 PDF들이 있는 디렉터리 (예: "/uploads/lec0").
   *  파일명 규칙: `p{슬라이드번호}.pdf`. 있으면 "현재 슬라이드 한 장만" 표시한다
   *  (scripts/split-pdf.mjs 로 생성). */
  slidesDir?: string;
}

/** 페르소나 정의 — 배움의 세계에만 투입. 말투만 바꾸고 사실은 절대 못 바꾼다. */
export interface Persona {
  id: string;
  name: string;
  /** 학생에게 보여줄 한 줄 설명 */
  tagline: string;
  /** 시스템 프롬프트에 주입할 말투 지침 */
  style: string;
}

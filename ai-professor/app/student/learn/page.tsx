"use client";

import UploadedViewer from "@/components/UploadedViewer";

// 학생 학습 화면 = 업로드 자료 뷰어(교수용 업로드 chrome 없음).
export default function StudentLearn() {
  return <UploadedViewer homeHref="/student" />;
}

"use client";

import UploadedViewer from "@/components/UploadedViewer";

// 교수 미리보기 = 학생 학습 화면과 동일한 뷰어 + 교수용 chrome(홈/다시 올리기).
export default function ProfessorPreview() {
  return <UploadedViewer homeHref="/professor" reuploadHref="/professor/upload" />;
}

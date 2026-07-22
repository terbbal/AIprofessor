import { getAllChapters } from "@/lib/chapterStore";

// 학생 홈용 챕터 목록. (가벼운 요약만 반환)
export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // 업로드 즉시 반영되도록 캐시 안 함

export async function GET() {
  const chapters = await getAllChapters();
  return Response.json(
    chapters.map((c) => ({
      id: c.id,
      title: c.title,
      slideCount: c.slides.length,
      pdfUrl: c.pdfUrl,
    })),
  );
}

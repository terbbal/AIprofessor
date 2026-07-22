import { getChapterById } from "@/lib/chapterStore";

// 학습 화면용 단일 챕터 (슬라이드 목록 + slidesDir/pdfUrl 포함).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const ch = await getChapterById(decodeURIComponent(params.id));
  if (!ch) {
    return Response.json({ error: "챕터를 찾을 수 없습니다." }, { status: 404 });
  }
  return Response.json({
    id: ch.id,
    title: ch.title,
    slidesDir: ch.slidesDir,
    pdfUrl: ch.pdfUrl,
    slides: ch.slides.map((s) => ({
      slide: s.slide,
      title: s.title,
      body: s.body,
      chapter: s.chapter,
    })),
  });
}

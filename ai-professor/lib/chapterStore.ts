import { promises as fs } from "fs";
import path from "path";
import { Chapter } from "@/lib/types";
import { staticChapters } from "@/data/chapters";

// 서버 전용: 정적 챕터(data/chapters.ts) + 업로드 챕터(public/uploads/chapters.json)를 병합.
// 이 모듈은 fs를 쓰므로 API 라우트(서버)에서만 import 한다.

const CHAPTERS_JSON = path.join(
  process.cwd(),
  "public",
  "uploads",
  "chapters.json",
);

export async function readUploadedChapters(): Promise<Chapter[]> {
  try {
    const raw = await fs.readFile(CHAPTERS_JSON, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data.chapters) ? (data.chapters as Chapter[]) : [];
  } catch {
    return [];
  }
}

// 전체 챕터 목록. 같은 id면 업로드본이 정적본을 덮어쓴다. 제목(파일명) 기준 정렬.
export async function getAllChapters(): Promise<Chapter[]> {
  const uploaded = await readUploadedChapters();
  const byId = new Map<string, Chapter>();
  for (const c of staticChapters) byId.set(c.id, c);
  for (const c of uploaded) byId.set(c.id, c);
  return Array.from(byId.values()).sort((a, b) =>
    a.title.localeCompare(b.title, "ko"),
  );
}

export async function getChapterById(id: string): Promise<Chapter | undefined> {
  const uploaded = await readUploadedChapters();
  return (
    uploaded.find((c) => c.id === id) ??
    staticChapters.find((c) => c.id === id)
  );
}

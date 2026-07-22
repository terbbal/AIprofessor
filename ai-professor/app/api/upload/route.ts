import { promises as fs } from "fs";
import path from "path";

// 자료 업로드. 교수가 올린 파일을 public/uploads/ 에 저장하고 manifest.json 을 남긴다.
// (오늘은 표시 전용. 로그인/DB/AI 연동은 다음 단계.)
export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MANIFEST = path.join(UPLOAD_DIR, "manifest.json");

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

interface Manifest {
  kind: "images" | "pdf";
  items: string[]; // public URL 목록 (예: /uploads/xxx.png)
  updatedAt: string;
}

// 원본 파일명을 최대한 보존한다. (챕터명 = 파일명 규칙을 위해)
// 파일시스템에 위험한 문자만 제거하고, 한글 등은 그대로 둔다.
function safeName(original: string, i: number): string {
  const ext = path.extname(original).toLowerCase().replace(/[^.a-z0-9]/g, "");
  const base =
    path
      .basename(original, path.extname(original))
      .normalize("NFC")
      .replace(/[\/\\?%*:|"<>\x00-\x1f]/g, "") // 경로·제어 문자 제거
      .replace(/\s+/g, "_")
      .slice(0, 80)
      .trim() || `slide-${Date.now()}-${i}`;
  return `${base}${ext}`;
}

export async function GET() {
  try {
    const raw = await fs.readFile(MANIFEST, "utf-8");
    return Response.json(JSON.parse(raw));
  } catch {
    return Response.json({ kind: "images", items: [], updatedAt: "" });
  }
}

export async function POST(req: Request) {
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return Response.json({ error: "파일이 없습니다." }, { status: 400 });
  }
  // PDF와 이미지를 섞어 올리면 안 됨 (표시 방식이 다름)
  const hasPdf = files.some((f) => f.type === "application/pdf");
  if (hasPdf && files.length > 1) {
    return Response.json(
      { error: "PDF는 한 개만 올려주세요. (이미지는 여러 장 가능)" },
      { status: 400 },
    );
  }
  for (const f of files) {
    if (!ALLOWED.has(f.type)) {
      return Response.json(
        { error: `지원하지 않는 형식입니다: ${f.type || f.name}` },
        { status: 400 },
      );
    }
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  // 이미지 여러 장이면 파일명 순으로 정렬해 슬라이드 순서를 안정적으로
  const ordered = [...files].sort((a, b) => a.name.localeCompare(b.name));

  const items: string[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const f = ordered[i];
    const buf = Buffer.from(await f.arrayBuffer());
    const name = safeName(f.name, i);
    await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
    items.push(`/uploads/${name}`);
  }

  const manifest: Manifest = {
    kind: hasPdf ? "pdf" : "images",
    items,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2), "utf-8");

  return Response.json(manifest);
}

import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";

// 자료 업로드. 교수가 올린 파일을 public/uploads/ 에 저장하고,
// PDF면 별도 node 스크립트로 "챕터"로 자동 변환한다(분할+텍스트추출→chapters.json).
export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MANIFEST = path.join(UPLOAD_DIR, "manifest.json");
// repo 루트의 "수업자료" 폴더에도 업로드 원본을 보관한다. (앱은 ai-professor/ 에서 실행 → 상위가 repo 루트)
const MATERIALS_DIR = path.join(process.cwd(), "..", "수업자료");

// 업로드된 PDF를 챕터로 변환하는 스크립트를 실행한다. (무거운 pdfjs/pdf-lib를 Next 번들과 분리)
function processPdf(pdfPath: string, id: string, title: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = path.join(process.cwd(), "scripts", "process-upload.mjs");
    const child = spawn(process.execPath, [script, pdfPath, id, title], {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("PDF 처리 시간이 초과되었습니다."));
    }, 120_000);
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      code === 0 ? resolve() : reject(new Error(`처리 실패 (code ${code})`));
    });
  });
}

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
// 원본 파일명 → 안전한 슬러그(=챕터 id, 파일명). 한글은 유지, 위험문자·중복표기 제거.
function slugify(original: string, fallbackIndex: number): string {
  return (
    path
      .basename(original, path.extname(original))
      .normalize("NFC")
      .replace(/\(\d+\)\s*$/, "") // "lec1(1)" → "lec1" (다운로드 중복 표기)
      .replace(/[\/\\?%*:|"<>()[\]{}#\x00-\x1f]/g, "") // 경로·URL 위험문자 제거
      .replace(/\s+/g, "_")
      .replace(/_+$/g, "")
      .slice(0, 80)
      .trim() || `slide-${Date.now()}-${fallbackIndex}`
  );
}

function safeName(original: string, i: number): string {
  const ext = path.extname(original).toLowerCase().replace(/[^.a-z0-9]/g, "");
  return `${slugify(original, i)}${ext}`;
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

  // 수업자료 보관 폴더 준비 (없으면 생성)
  await fs.mkdir(MATERIALS_DIR, { recursive: true }).catch(() => {});

  const items: string[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const f = ordered[i];
    const buf = Buffer.from(await f.arrayBuffer());
    const name = safeName(f.name, i);
    await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
    // 수업자료 폴더에도 사본 보관 (실패해도 업로드 자체는 계속)
    await fs
      .writeFile(path.join(MATERIALS_DIR, name), buf)
      .catch((e) => console.error("[upload] 수업자료 보관 실패:", e));
    items.push(`/uploads/${name}`);
  }

  const manifest: Manifest = {
    kind: hasPdf ? "pdf" : "images",
    items,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2), "utf-8");

  // PDF면 챕터로 자동 변환 (파일명 = 챕터명·id)
  if (hasPdf) {
    const savedName = path.basename(items[0]); // 예: lec1.pdf
    const id = slugify(ordered[0].name, 0);
    const title = id;
    try {
      await processPdf(path.join(UPLOAD_DIR, savedName), id, title);
    } catch (e) {
      return Response.json(
        { ...manifest, warning: `챕터 변환 중 오류: ${(e as Error).message}` },
        { status: 200 },
      );
    }
    return Response.json({ ...manifest, chapterId: id });
  }

  return Response.json(manifest);
}

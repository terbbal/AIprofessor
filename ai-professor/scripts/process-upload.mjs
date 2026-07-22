// 업로드된 강의 PDF를 "챕터"로 자동 변환한다. (업로드 API가 서버에서 실행)
//   1) 페이지별 1장짜리 PDF로 분할  → public/uploads/<id>/p{N}.pdf
//   2) 페이지별 텍스트 추출          → 슬라이드 뼈대 노트
//   3) public/uploads/chapters.json 에 챕터 upsert (같은 id면 교체)
//
// 무거운 의존성(pdfjs/pdf-lib)을 Next 번들에서 분리하려고 별도 node 프로세스로 돌린다.
//
// 사용법: node scripts/process-upload.mjs <pdf경로> <id> <제목>
import { PDFDocument } from "pdf-lib";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const [, , pdfPath, id, titleArg] = process.argv;
if (!pdfPath || !id) {
  console.error("usage: node scripts/process-upload.mjs <pdf> <id> [title]");
  process.exit(1);
}
const title = titleArg || id;
const cwd = process.cwd();
const uploadsDir = path.join(cwd, "public", "uploads");
const outDir = path.join(uploadsDir, id);
const chaptersJson = path.join(uploadsDir, "chapters.json");

// --- 1) 페이지별 분할 -------------------------------------------------------
const srcBytes = await readFile(pdfPath);
const srcDoc = await PDFDocument.load(srcBytes);
const numPages = srcDoc.getPageCount();
await mkdir(outDir, { recursive: true });
for (let i = 0; i < numPages; i++) {
  const one = await PDFDocument.create();
  const [pg] = await one.copyPages(srcDoc, [i]);
  one.addPage(pg);
  await writeFile(path.join(outDir, `p${i + 1}.pdf`), await one.save());
}

// --- 2) 페이지별 텍스트 추출 ------------------------------------------------
const pdfjs = await import(
  pathToFileURL(
    path.join(cwd, "node_modules", "pdfjs-dist", "legacy", "build", "pdf.mjs"),
  ).href
);
const doc = await pdfjs.getDocument({
  data: new Uint8Array(srcBytes),
  useSystemFonts: true,
}).promise;

// 페이지 하단 반복 푸터/페이지번호 같은 잡음 제거
function isNoise(line) {
  if (!line) return true;
  if (/^\s*\d{1,3}\s*\/\s*\d{1,3}\s*$/.test(line)) return true; // "3/14"
  if (/\b\d{1,3}\s*\/\s*\d{1,3}\s*$/.test(line) && line.length < 60) return true;
  return false;
}

function extractLines(items) {
  const lines = [];
  let line = "";
  let lastY = null;
  for (const it of items) {
    const y = it.transform[5];
    if (lastY !== null && Math.abs(y - lastY) > 3) {
      lines.push(line);
      line = "";
    }
    line += it.str;
    if (it.hasEOL) {
      lines.push(line);
      line = "";
    }
    lastY = y;
  }
  if (line) lines.push(line);
  return lines.map((l) => l.trim()).filter((l) => l.length > 0);
}

const slides = [];
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  const raw = extractLines(tc.items).filter((l) => !isNoise(l));
  const slideTitle = raw[0] || `슬라이드 ${p}`;
  const rest = raw.slice(1);
  const keyFacts = rest.slice(0, 12);
  slides.push({
    slide: p,
    title: slideTitle,
    body: raw.join("\n") || `(슬라이드 ${p})`,
    key_facts: keyFacts.length ? keyFacts : [slideTitle],
  });
}

// --- 3) chapters.json upsert ------------------------------------------------
const chapter = {
  id,
  title,
  pdfUrl: `/uploads/${path.basename(pdfPath)}`,
  slidesDir: `/uploads/${id}`,
  slides,
};

let store = { chapters: [] };
try {
  store = JSON.parse(await readFile(chaptersJson, "utf-8"));
  if (!Array.isArray(store.chapters)) store.chapters = [];
} catch {
  store = { chapters: [] };
}
const idx = store.chapters.findIndex((c) => c.id === id);
if (idx >= 0) store.chapters[idx] = chapter;
else store.chapters.push(chapter);
store.updatedAt = new Date().toISOString();
await writeFile(chaptersJson, JSON.stringify(store, null, 2), "utf-8");

console.log(`챕터 생성 완료: id=${id}, ${numPages}슬라이드 → chapters.json`);

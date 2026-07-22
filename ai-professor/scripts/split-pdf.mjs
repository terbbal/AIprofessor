// 업로드된 강의 PDF를 페이지별 1장짜리 PDF로 분할한다.
// 학습 화면에서 "현재 슬라이드 한 장만" 보여주기 위함 (1페이지 PDF → 스크롤로 다른 슬라이드가 안 보임).
//
// 사용법:
//   node scripts/split-pdf.mjs public/uploads/lec0.pdf public/uploads/lec0
//   → public/uploads/lec0/p1.pdf, p2.pdf, ...
import { PDFDocument } from "pdf-lib";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const [, , src, outDir] = process.argv;
if (!src || !outDir) {
  console.error("usage: node scripts/split-pdf.mjs <src.pdf> <outDir>");
  process.exit(1);
}

const bytes = await readFile(src);
const doc = await PDFDocument.load(bytes);
const n = doc.getPageCount();
await mkdir(outDir, { recursive: true });

for (let i = 0; i < n; i++) {
  const out = await PDFDocument.create();
  const [page] = await out.copyPages(doc, [i]);
  out.addPage(page);
  const outBytes = await out.save();
  await writeFile(path.join(outDir, `p${i + 1}.pdf`), outBytes);
}
console.log(`분할 완료: ${n}페이지 → ${outDir}/p1.pdf ~ p${n}.pdf`);

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 교수 전용 자료 업로드. (접근 가드는 /professor/layout.tsx)
export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setFiles(Array.from(e.target.files ?? []));
  }

  async function upload() {
    if (files.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "업로드에 실패했습니다.");
        return;
      }
      router.push("/professor/preview");
    } catch {
      setError("업로드 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-24">
        <Link
          href="/professor"
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-900"
        >
          ← 교수 홈
        </Link>

        <h1 className="mb-3 mt-6 text-3xl font-semibold tracking-tight text-zinc-900">
          수업 자료 올리기
        </h1>
        <p className="mb-10 text-zinc-500">
          강의 슬라이드를 올리면 학생 학습 화면에 그대로 표시됩니다.
          <br />
          이미지(PNG·JPG)는 장당 한 슬라이드로, PDF는 문서 그대로 보입니다.
        </p>

        <label className="block cursor-pointer rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center transition-colors hover:border-zinc-400 hover:bg-zinc-100">
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
            onChange={onPick}
            className="hidden"
          />
          <div className="text-sm font-medium text-zinc-700">
            여기를 눌러 파일 선택
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            이미지 여러 장 또는 PDF 한 개
          </div>
        </label>

        {files.length > 0 && (
          <div className="mt-6 rounded-xl border border-zinc-200">
            <div className="border-b border-zinc-100 px-4 py-2.5 text-xs font-medium text-zinc-400">
              선택한 파일 {files.length}개
            </div>
            <ul className="divide-y divide-zinc-100">
              {files.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between px-4 py-2.5 text-sm text-zinc-700"
                >
                  <span className="truncate">{f.name}</span>
                  <span className="ml-3 shrink-0 text-xs text-zinc-400">
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={upload}
            disabled={busy || files.length === 0}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-30"
          >
            {busy ? "올리는 중…" : "올리고 미리보기"}
          </button>
          <Link
            href="/professor/preview"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-900"
          >
            이미 올린 자료 보기 →
          </Link>
        </div>
      </div>
    </main>
  );
}

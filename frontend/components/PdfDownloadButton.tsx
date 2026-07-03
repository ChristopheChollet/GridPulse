"use client";

import { useState } from "react";

type Props = {
  label: string;
  filename: string;
  exportFn: () => Promise<string>;
};

export function PdfDownloadButton({ label, filename, exportFn }: Props) {
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    setErr(null);
    setPending(true);
    try {
      const base64 = await exportFn();
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Export impossible");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="export-btn"
      >
        {pending ? "Export…" : label}
      </button>
      {err ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{err}</p> : null}
    </div>
  );
}

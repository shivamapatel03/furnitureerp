"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

export default function PrintActionButton({ billId }: { billId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/pdf/bill/${billId}`);
      if (!res.ok) throw new Error("Failed to download");
      const blob = await res.blob();
      const contentDisposition = res.headers.get("content-disposition");
      let filename = `Invoice_${billId}.pdf`;
      if (contentDisposition && contentDisposition.includes("filename=")) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      window.location.href = `/api/pdf/bill/${billId}`;
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 700);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isLoading}
      className="p-2 text-gray-600 dark:text-slate-300 hover:text-primary hover:bg-primary/10 active:scale-95 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold disabled:opacity-70"
      title="Download Bill PDF"
    >
      {isLoading ? (
        <>
          <Loader2 size={17} className="animate-spin text-primary" />
          <span className="sm:hidden text-primary">Preparing...</span>
        </>
      ) : (
        <>
          <Download size={17} />
          <span className="sm:hidden">Download</span>
        </>
      )}
    </button>
  );
}

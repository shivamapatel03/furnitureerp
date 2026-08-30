"use client";

import { Download, Edit, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ActionButtons({ 
  billId, 
  billNumber, 
  customerName 
}: { 
  billId?: string; 
  billNumber: string; 
  customerName?: string | null; 
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDownloading || !billId) return;

    setIsDownloading(true);
    try {
      const res = await fetch(`/api/pdf/bill/${billId}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const contentDisposition = res.headers.get("content-disposition");
      let filename = `Invoice_${billNumber}.pdf`;
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
      console.error("Download error:", err);
      window.location.href = `/api/pdf/bill/${billId}`;
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
      }, 700);
    }
  };

  return (
    <div className="w-full max-w-3xl flex flex-wrap items-center justify-between gap-2.5 mb-4 print:hidden">
      {billId ? (
        <Link
          href={`/billing/${billId}/edit`}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-semibold text-xs sm:text-sm rounded-xl transition-all border border-gray-200 dark:border-slate-700"
        >
          <Edit size={16} />
          <span>Edit Bill</span>
        </Link>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark active:scale-98 text-white disabled:opacity-75 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm"
        >
          {isDownloading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Preparing PDF...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Download Bill</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

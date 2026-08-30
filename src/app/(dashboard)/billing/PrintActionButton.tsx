"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { getBillById } from "@/app/actions/billing";
import { getSettings } from "@/app/actions/settings";
import { downloadBillPdf } from "@/lib/downloadPdf";

export default function PrintActionButton({ billId }: { billId: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const [bill, settings] = await Promise.all([
        getBillById(billId),
        getSettings(),
      ]);

      if (!bill) {
        alert("Invoice could not be loaded.");
        return;
      }

      await downloadBillPdf(bill, settings);
    } catch (err) {
      console.error("Direct bill download error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className="p-2 text-gray-600 dark:text-slate-300 hover:text-primary hover:bg-primary/10 active:scale-95 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold disabled:opacity-60"
      title="Download Bill PDF"
    >
      {isDownloading ? (
        <>
          <Loader2 size={16} className="animate-spin text-primary" />
          <span className="sm:hidden">Downloading...</span>
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

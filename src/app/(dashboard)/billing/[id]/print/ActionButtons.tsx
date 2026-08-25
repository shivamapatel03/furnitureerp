"use client";

import { Download } from "lucide-react";
import { downloadInvoicePdf } from "@/lib/downloadPdf";
import { useState } from "react";

export default function ActionButtons({ billNumber, customerName }: { billNumber: string; customerName?: string | null }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const safeName = customerName ? customerName.trim().replace(/[/\\?%*:|"<>]/g, "_") : "";
      const filename = safeName ? `${safeName}_${billNumber}.pdf` : `Invoice_${billNumber}.pdf`;
      await downloadInvoicePdf("print-area", filename);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl flex justify-center sm:justify-end mb-4 print:hidden">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark active:scale-98 text-white disabled:opacity-70 px-6 py-3 rounded-lg font-bold text-sm sm:text-base transition-all shadow-md"
      >
        {isDownloading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <Download size={18} />
            <span>Download PDF Invoice</span>
          </>
        )}
      </button>
    </div>
  );
}

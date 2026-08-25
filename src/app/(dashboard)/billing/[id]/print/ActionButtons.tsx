"use client";

import { Download } from "lucide-react";
import { downloadInvoicePdf } from "@/lib/downloadPdf";
import { useState } from "react";

export default function ActionButtons({ billNumber }: { billNumber: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePdf("print-area", `Invoice_${billNumber}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-0 bg-white sm:bg-transparent border-t sm:border-t-0 border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-none z-40 sm:relative sm:z-auto flex justify-center sm:justify-end w-full sm:w-auto print:hidden pb-safe">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-dark active:scale-98 text-white disabled:opacity-70 px-6 py-3.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all shadow-md"
      >
        {isDownloading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <Download size={20} />
            <span>Download PDF Invoice</span>
          </>
        )}
      </button>
    </div>
  );
}

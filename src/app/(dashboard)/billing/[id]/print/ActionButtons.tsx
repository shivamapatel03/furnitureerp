"use client";

import { Download, Printer, Edit, Loader2 } from "lucide-react";
import { downloadInvoicePdf } from "@/lib/downloadPdf";
import { useState } from "react";
import Link from "next/link";

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

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const safeName = customerName ? customerName.trim().replace(/[/\\?%*:|"<>]/g, "_") : "";
      const filename = safeName ? `${safeName}_${billNumber}.pdf` : `Invoice_${billNumber}.pdf`;
      await downloadInvoicePdf("print-area", filename);
    } catch (err) {
      console.error("PDF download trigger error:", err);
      if (typeof window !== "undefined") {
        window.print();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
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
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 dark:bg-slate-100 hover:bg-black text-white dark:text-slate-900 font-bold text-xs sm:text-sm rounded-xl active:scale-98 transition-all shadow-sm"
          title="Print Invoice"
        >
          <Printer size={16} />
          <span>Print</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark active:scale-98 text-white disabled:opacity-70 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm"
        >
          {isDownloading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving PDF...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

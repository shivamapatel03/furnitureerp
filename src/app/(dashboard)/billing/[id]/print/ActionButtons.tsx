"use client";

import { Download, Edit, Loader2 } from "lucide-react";
import { downloadBillPdf, downloadInvoicePdf } from "@/lib/downloadPdf";
import { getBillById } from "@/app/actions/billing";
import { getSettings } from "@/app/actions/settings";
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
      if (billId) {
        const [bill, settings] = await Promise.all([
          getBillById(billId),
          getSettings(),
        ]);
        if (bill) {
          await downloadBillPdf(bill, settings);
          return;
        }
      }

      // Fallback
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
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark active:scale-98 text-white disabled:opacity-70 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm"
        >
          {isDownloading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Downloading...</span>
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

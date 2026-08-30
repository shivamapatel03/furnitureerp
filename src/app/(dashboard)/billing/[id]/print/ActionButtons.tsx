"use client";

import { Download, Edit } from "lucide-react";
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
  const downloadUrl = billId ? `/api/pdf/bill/${billId}` : "#";

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
        <a
          href={downloadUrl}
          download
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark active:scale-98 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm"
        >
          <Download size={16} />
          <span>Download Bill</span>
        </a>
      </div>
    </div>
  );
}

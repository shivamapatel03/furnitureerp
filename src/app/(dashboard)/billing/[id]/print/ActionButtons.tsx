"use client";

import { Download, Printer } from "lucide-react";
import { downloadInvoicePdf } from "@/lib/downloadPdf";
import { useState } from "react";

export default function ActionButtons({ billNumber }: { billNumber: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePdf("print-area", `Invoice_${billNumber}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-0 bg-white sm:bg-transparent border-t sm:border-t-0 border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-none z-40 sm:relative sm:z-auto flex gap-3 w-full sm:w-auto print:hidden pb-safe">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-100 sm:bg-white border sm:border-gray-300 border-transparent text-gray-800 hover:bg-gray-200 disabled:opacity-70 px-4 sm:px-6 py-3.5 sm:py-3 rounded-xl font-bold sm:font-medium transition-colors shadow-sm"
      >
        {isDownloading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            <span>Downloading...</span>
          </>
        ) : (
          <>
            <Download size={18} />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">Download</span>
          </>
        )}
      </button>
      <button
        onClick={handlePrint}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary sm:bg-gray-900 hover:bg-primary-dark sm:hover:bg-gray-800 text-white px-4 sm:px-6 py-3.5 sm:py-3 rounded-xl font-bold sm:font-medium transition-colors shadow-sm"
      >
        <Printer size={18} />
        <span className="hidden sm:inline">Print Invoice</span>
        <span className="sm:hidden">Print</span>
      </button>
    </div>
  );
}

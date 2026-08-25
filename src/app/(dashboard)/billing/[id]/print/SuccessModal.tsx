"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Download, X } from "lucide-react";

import { downloadInvoicePdf } from "@/lib/downloadPdf";

export default function SuccessModal({ billNumber, customerName }: { billNumber: string; customerName?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Show modal on mount
    setIsOpen(true);
  }, []);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-end sm:hidden bg-black/60 p-0 print:hidden backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl p-6 w-full shadow-2xl relative animate-in slide-in-from-bottom duration-300 border-t border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5" />
        
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={30} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Bill Generated!</h2>
          <p className="text-gray-500 text-xs font-medium">Invoice #{billNumber} is ready to download</p>
        </div>

        <div className="space-y-3 pb-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-dark active:scale-98 disabled:opacity-75 text-white px-5 py-3.5 rounded-xl font-bold text-base transition-all shadow-md"
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
          
          <button
            onClick={() => setIsOpen(false)}
            className="w-full text-center py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors mt-2 block"
          >
            Close & View Bill on Screen
          </button>
        </div>
      </div>
    </div>
  );
}

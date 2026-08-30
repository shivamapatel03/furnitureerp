"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Download, X } from "lucide-react";

export default function SuccessModal({ 
  billId,
  billNumber, 
  customerName 
}: { 
  billId?: string;
  billNumber: string; 
  customerName?: string | null; 
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal on mount
    setIsOpen(true);
  }, []);

  if (!isOpen) return null;

  const downloadUrl = billId ? `/api/pdf/bill/${billId}` : "#";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:hidden bg-black/60 p-0 print:hidden backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-t-2xl p-6 w-full shadow-2xl relative animate-in slide-in-from-bottom duration-300 border-t border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto mb-5" />
        
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-950/60 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={30} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">Bill Generated!</h2>
          <p className="text-gray-500 dark:text-slate-400 text-xs font-medium">Invoice #{billNumber} is ready</p>
        </div>

        <div className="space-y-3 pb-2">
          <a
            href={downloadUrl}
            download
            className="w-full flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-dark active:scale-98 text-white px-5 py-3.5 rounded-lg font-bold text-base transition-all shadow-md"
          >
            <Download size={20} />
            <span>Download PDF Invoice</span>
          </a>
          
          <button
            onClick={() => setIsOpen(false)}
            className="w-full text-center py-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition-colors mt-2 block"
          >
            Close & View Bill on Screen
          </button>
        </div>
      </div>
    </div>
  );
}

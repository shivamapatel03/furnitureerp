"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Download, Printer, X } from "lucide-react";

export default function SuccessModal({ billNumber }: { billNumber: string }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal on mount
    setIsOpen(true);
  }, []);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;
      
      const element = document.getElementById("print-area");
      if (!element) return;
      
      const opt = {
        margin: 0.2,
        filename: `Invoice_${billNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      // @ts-expect-error - loosely typed
      html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error("Failed to generate PDF", e);
      alert("Failed to generate PDF. Please use the Print option and save as PDF instead.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Bill Generated!</h2>
          <p className="text-gray-500 text-sm">Invoice #{billNumber} has been successfully created and saved.</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95"
          >
            <Download size={20} />
            Download PDF
          </button>
          
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95"
          >
            <Printer size={20} />
            Print Invoice
          </button>
          
          <button
            onClick={() => setIsOpen(false)}
            className="w-full text-center py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors mt-2 block"
          >
            Close & View Bill
          </button>
        </div>
      </div>
    </div>
  );
}

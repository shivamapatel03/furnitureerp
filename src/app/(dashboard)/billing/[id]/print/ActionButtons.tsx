"use client";

import { Download, Printer } from "lucide-react";

export default function ActionButtons({ billNumber }: { billNumber: string }) {
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
    <div className="flex gap-3 w-full sm:w-auto">
      <button
        onClick={handleDownload}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-colors shadow-sm"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Download PDF</span>
        <span className="sm:hidden">Download</span>
      </button>
      <button
        onClick={handlePrint}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-colors shadow-sm"
      >
        <Printer size={18} />
        <span className="hidden sm:inline">Print Invoice</span>
        <span className="sm:hidden">Print</span>
      </button>
    </div>
  );
}

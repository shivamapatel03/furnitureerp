"use client";

import { Download, X, ExternalLink } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function PrintActionButton({ billId }: { billId: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <Link
          href={`/billing/${billId}/print`}
          className="sm:hidden p-2 text-gray-600 active:text-primary active:bg-primary/10 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
          title="Download Invoice"
        >
          <Download size={16} />
          <span>Download</span>
        </Link>

        <button 
          onClick={() => setShowModal(true)}
          className="hidden sm:inline-flex p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          title="Preview & Download Invoice"
        >
          <Download size={18} />
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3.5 sm:p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-gray-800 text-base sm:text-lg">Invoice Preview</h2>
              <div className="flex items-center gap-2">
                <Link
                  href={`/billing-print/${billId}`}
                  target="_blank"
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>Open Fullscreen</span>
                </Link>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 relative">
              <iframe 
                src={`/billing-print/${billId}`} 
                className="w-full h-full border-none"
                title="Invoice Print Preview"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { Download } from "lucide-react";

export default function PrintActionButton({ billId }: { billId: string }) {
  return (
    <a
      href={`/api/pdf/bill/${billId}`}
      download
      className="p-2 text-gray-600 dark:text-slate-300 hover:text-primary hover:bg-primary/10 active:scale-95 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold"
      title="Download Bill PDF"
    >
      <Download size={17} />
      <span className="sm:hidden">Download</span>
    </a>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { deleteBill } from "@/app/actions/billing";

export default function DeleteBillButton({
  billId,
  billNumber,
}: {
  billId: string;
  billNumber: string;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteBill(billId);
      if (result.success) {
        setShowConfirm(false);
      } else {
        alert(result.error || "Failed to delete bill.");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors"
        title="Delete Bill"
        aria-label="Delete Bill"
      >
        <Trash2 size={17} />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Invoice?</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Are you sure you want to delete invoice <strong className="text-gray-900">{billNumber}</strong>?
              </p>
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p>• Product stock deducted for this bill will be automatically restored.</p>
                <p>• Customer total purchase amount will be adjusted.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-98 rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Yes, Delete Bill</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

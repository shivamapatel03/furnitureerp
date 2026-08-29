"use client";

import { useState } from "react";
import { deleteProduct } from "@/app/actions/products";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      const res = await deleteProduct(id);
      if (res && res.success) {
        setShowConfirm(false);
        router.refresh();
      } else {
        alert(res?.error || "Failed to delete product.");
      }
    } catch (err: any) {
      alert(err?.message || "An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowConfirm(true);
        }}
        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:text-slate-400 dark:hover:text-red-400 rounded-lg transition-colors"
        title="Delete product"
      >
        <Trash2 size={18} />
      </button>

      {showConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => !isDeleting && setShowConfirm(false)}
        >
          <div 
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-2xl border border-gray-100 dark:border-slate-800 text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              type="button"
              disabled={isDeleting}
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Warning Icon */}
            <div className="w-14 h-14 bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-3.5">
              <AlertTriangle size={28} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">
              Delete Product?
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-800 dark:text-slate-200">"{name}"</span>? This will permanently remove this item from your inventory.
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowConfirm(false)}
                className="w-1/2 py-2.5 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold rounded-xl active:scale-98 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete
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

"use client";

import { deleteProduct } from "@/app/actions/products";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res && !res.success) {
        alert(res.error);
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Delete product"
    >
      <Trash2 size={18} />
    </button>
  );
}

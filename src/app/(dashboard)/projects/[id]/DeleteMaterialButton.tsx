"use client";

import { deleteMaterialUsage } from "@/app/actions/projects";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export default function DeleteMaterialButton({ id, projectId }: { id: string; projectId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("Remove this material entry?")) return;
        startTransition(() => deleteMaterialUsage(id, projectId));
      }}
      disabled={isPending}
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
      title="Remove material"
    >
      <Trash2 size={15} />
    </button>
  );
}

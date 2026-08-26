"use client";

import { deleteProject } from "@/app/actions/projects";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProjectButton({ 
  id, 
  name,
  compact = false
}: { 
  id: string; 
  name: string;
  compact?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Delete project "${name}"? All material records will be lost. This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteProject(id);
      router.push("/projects");
      router.refresh();
    });
  }

  if (compact) {
    return (
      <button
        onClick={handleDelete}
        disabled={isPending}
        title="Delete project"
        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors disabled:opacity-50"
      >
        <Trash2 size={15} />
      </button>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors disabled:opacity-50 shadow-xs"
    >
      <Trash2 size={14} />
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}

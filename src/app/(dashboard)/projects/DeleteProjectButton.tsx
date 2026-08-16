"use client";

import { deleteProject } from "@/app/actions/projects";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProjectButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Delete project "${name}"? All material records will be lost. This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteProject(id);
      router.push("/projects");
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      <Trash2 size={16} />
      {isPending ? "Deleting…" : "Delete Project"}
    </button>
  );
}

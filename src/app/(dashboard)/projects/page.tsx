import { getProjects } from "@/app/actions/projects";
import Link from "next/link";
import { Plus, MapPin, Calendar, Package, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import DeleteProjectButton from "./DeleteProjectButton";

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  PLANNING: "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300",
  IN_PROGRESS: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400",
  COMPLETED: "bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Projects</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Track client sites, materials, and schedules</p>
        </div>
        <Link
          href="/projects/new"
          className="bg-primary hover:bg-primary-dark active:scale-98 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs p-8 sm:p-16 text-center transition-colors">
          <Package size={48} className="mx-auto mb-3 text-gray-300 dark:text-slate-600" />
          <p className="text-base font-bold text-gray-900 dark:text-slate-100 mb-1">No projects registered</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">Create your first client site project to track materials.</p>
          <Link 
            href="/projects/new" 
            className="bg-primary hover:bg-primary-dark active:scale-98 text-white px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {projects.map(project => {
            const totalCost = project.materialUsages.reduce(
              (sum, m) => sum + m.quantity * (m.product.purchasePrice ?? m.product.sellingPrice), 0
            );
            return (
              <div key={project.id} className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  {/* Top row */}
                  <div className="flex justify-between items-start mb-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100 leading-snug">{project.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ml-2 ${STATUS_STYLES[project.status] ?? "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300"}`}>
                      {project.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Meta info */}
                  <div className="space-y-1.5 text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                    {project.customer && (
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate">{project.customer.name} · {project.customer.mobile}</span>
                      </div>
                    )}
                    {project.siteAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-gray-400 dark:text-slate-500 mt-0.5 shrink-0" />
                        <span className="line-clamp-1 text-gray-500 dark:text-slate-400">{project.siteAddress}</span>
                      </div>
                    )}
                    {(project.startDate || project.deadline) && (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400 dark:text-slate-500 shrink-0" />
                        <span className="text-gray-500 dark:text-slate-400">
                          {project.startDate ? format(new Date(project.startDate), 'dd MMM') : "—"}
                          {project.deadline ? ` → ${format(new Date(project.deadline), 'dd MMM yyyy')}` : ""}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <Package size={14} className="text-gray-400 dark:text-slate-500 shrink-0" />
                      <span className="font-semibold text-gray-700 dark:text-slate-300">{project.materialUsages.length} material{project.materialUsages.length !== 1 ? 's' : ''}</span>
                      {project.materialUsages.length > 0 && (
                        <span className="text-gray-400 dark:text-slate-500">· ₹{totalCost.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3.5 mt-3.5 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center gap-2">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-primary hover:text-primary-dark font-bold text-xs sm:text-sm flex items-center gap-1 group whitespace-nowrap"
                  >
                    View Details
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/projects/${project.id}/edit`}
                      className="px-2.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteProjectButton id={project.id} name={project.name} compact />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

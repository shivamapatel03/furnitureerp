import { createProject } from "@/app/actions/projects";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/projects" className="p-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">New Project</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Track client sites and material allocations</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs p-4 sm:p-6 transition-colors">
        <form action={createProject} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">

            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Project Name *</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g. Patel Residence - Modular Kitchen" 
              />
            </div>

            <div>
              <label htmlFor="customerMobile" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Customer Mobile</label>
              <input 
                type="tel" 
                id="customerMobile" 
                name="customerMobile"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="10-digit mobile number" 
              />
            </div>

            <div>
              <label htmlFor="customerName" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Customer Name</label>
              <input 
                type="text" 
                id="customerName" 
                name="customerName"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="Client full name" 
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Start Date</label>
              <input 
                type="date" 
                id="startDate" 
                name="startDate"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Target Deadline</label>
              <input 
                type="date" 
                id="deadline" 
                name="deadline"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="status" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Project Status</label>
              <select 
                id="status" 
                name="status"
                defaultValue="PLANNING"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="PLANNING">Planning & Design</option>
                <option value="IN_PROGRESS">In Progress (Execution)</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="siteAddress" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Site Address</label>
              <textarea 
                id="siteAddress" 
                name="siteAddress" 
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                placeholder="Full address of the installation site" 
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notes" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Special Notes / Specifications</label>
              <textarea 
                id="notes" 
                name="notes" 
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                placeholder="Custom requirements, hardware specifications..." 
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 border-t border-gray-100 dark:border-slate-800">
            <Link 
              href="/projects" 
              className="w-full sm:w-auto px-5 py-2.5 text-center text-sm font-semibold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 active:scale-98 rounded-lg transition-all"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark active:scale-98 rounded-lg transition-all shadow-sm"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

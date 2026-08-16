import { getProjectById, updateProject } from "@/app/actions/projects";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const action = updateProject.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/projects/${id}`} className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Project</h1>
          <p className="text-xs sm:text-sm text-gray-500">Update project details and status</p>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6">
        <form action={action} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">

            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-1">Project Name *</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                defaultValue={project.name}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>

            <div>
              <label htmlFor="customerMobile" className="block text-xs font-semibold text-gray-700 mb-1">Customer Mobile</label>
              <input 
                type="tel" 
                id="customerMobile" 
                name="customerMobile"
                defaultValue={project.customer?.mobile ?? ""}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>

            <div>
              <label htmlFor="customerName" className="block text-xs font-semibold text-gray-700 mb-1">Customer Name</label>
              <input 
                type="text" 
                id="customerName" 
                name="customerName"
                defaultValue={project.customer?.name ?? ""}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
              <input 
                type="date" 
                id="startDate" 
                name="startDate"
                defaultValue={project.startDate ? format(new Date(project.startDate), 'yyyy-MM-dd') : ""}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white" 
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-xs font-semibold text-gray-700 mb-1">Deadline</label>
              <input 
                type="date" 
                id="deadline" 
                name="deadline"
                defaultValue={project.deadline ? format(new Date(project.deadline), 'yyyy-MM-dd') : ""}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white" 
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="status" className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select 
                id="status" 
                name="status" 
                defaultValue={project.status}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white"
              >
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="siteAddress" className="block text-xs font-semibold text-gray-700 mb-1">Site Address</label>
              <textarea 
                id="siteAddress" 
                name="siteAddress" 
                rows={2}
                defaultValue={project.siteAddress ?? ""}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" 
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notes" className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
              <textarea 
                id="notes" 
                name="notes" 
                rows={2}
                defaultValue={project.notes ?? ""}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none" 
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 border-t border-gray-100">
            <Link 
              href={`/projects/${id}`} 
              className="w-full sm:w-auto px-5 py-2.5 text-center text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-98 rounded-xl transition-all"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark active:scale-98 rounded-xl transition-all shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

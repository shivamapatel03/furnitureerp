import { getProjectById } from "@/app/actions/projects";
import { getProducts } from "@/app/actions/products";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, MapPin, Calendar, User, Edit, Package, IndianRupee } from "lucide-react";
import AddMaterialForm from "./AddMaterialForm";
import DeleteMaterialButton from "./DeleteMaterialButton";
import DeleteProjectButton from "../DeleteProjectButton";

const STATUS_STYLES: Record<string, string> = {
  PLANNING: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
};

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [project, products] = await Promise.all([getProjectById(id), getProducts()]);

  if (!project) notFound();

  const totalCost = project.materialUsages.reduce(
    (sum, m) => sum + m.quantity * (m.product.purchasePrice ?? m.product.sellingPrice),
    0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{project.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[project.status] ?? "bg-gray-100 text-gray-700"}`}>
                {project.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Created {format(new Date(project.createdAt), 'dd MMM yyyy')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            href={`/projects/${id}/edit`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors shadow-xs"
          >
            <Edit size={14} />
            Edit
          </Link>
          <DeleteProjectButton id={id} name={project.name} />
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {project.customer && (
          <div className="bg-white border border-gray-200 shadow-xs rounded-xl sm:rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
              <User size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-400 uppercase">Customer</p>
              <p className="font-bold text-gray-900 text-sm truncate">{project.customer.name}</p>
              <p className="text-xs text-gray-500">{project.customer.mobile}</p>
            </div>
          </div>
        )}
        {project.siteAddress && (
          <div className="bg-white border border-gray-200 shadow-xs rounded-xl sm:rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <MapPin size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-400 uppercase">Site Location</p>
              <p className="font-semibold text-gray-900 text-sm line-clamp-2">{project.siteAddress}</p>
            </div>
          </div>
        )}
        {(project.startDate || project.deadline) && (
          <div className="bg-white border border-gray-200 shadow-xs rounded-xl sm:rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl shrink-0">
              <Calendar size={16} />
            </div>
            <div className="min-w-0 text-xs">
              <p className="text-[11px] font-semibold text-gray-400 uppercase">Timeline</p>
              {project.startDate && <p className="text-gray-700">Start: <span className="font-bold text-gray-900">{format(new Date(project.startDate), 'dd MMM yyyy')}</span></p>}
              {project.deadline && <p className="text-gray-700 mt-0.5">End: <span className="font-bold text-primary">{format(new Date(project.deadline), 'dd MMM yyyy')}</span></p>}
            </div>
          </div>
        )}
      </div>

      {project.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-3.5 text-xs sm:text-sm text-amber-900">
          📝 <span className="font-bold">Project Notes:</span> {project.notes}
        </div>
      )}

      {/* Materials Section */}
      <div className="bg-white border border-gray-200 shadow-xs rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-gray-500" />
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">Materials Allocated</h2>
            <span className="text-xs bg-primary/10 text-primary font-extrabold rounded-full px-2 py-0.5">
              {project.materialUsages.length}
            </span>
          </div>
          <AddMaterialForm projectId={id} products={products} />
        </div>

        {/* Mobile View: Material Cards */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {project.materialUsages.length > 0 ? (
            project.materialUsages.map(m => {
              const unitCost = m.product.purchasePrice ?? m.product.sellingPrice;
              return (
                <div key={m.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{m.product.name}</h4>
                      <p className="text-xs text-gray-400">{m.area ? `Area: ${m.area}` : "General Area"}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-gray-900 text-sm">₹{(m.quantity * unitCost).toLocaleString()}</span>
                      <span className="text-xs text-gray-400 block">{m.quantity} {m.product.unit} @ ₹{unitCost}</span>
                    </div>
                  </div>
                  {m.notes && <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">{m.notes}</p>}
                  <div className="flex justify-end pt-1">
                    <DeleteMaterialButton id={m.id} projectId={id} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs">
              No materials logged yet. Tap 'Add Material' above to record usage.
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          {project.materialUsages.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                  <th className="px-6 py-3.5 text-left">Product</th>
                  <th className="px-6 py-3.5 text-left">Area / Room</th>
                  <th className="px-6 py-3.5 text-center">Qty</th>
                  <th className="px-6 py-3.5 text-right">Unit Cost</th>
                  <th className="px-6 py-3.5 text-right">Total</th>
                  <th className="px-6 py-3.5 text-left">Notes</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {project.materialUsages.map(m => {
                  const unitCost = m.product.purchasePrice ?? m.product.sellingPrice;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-gray-900">{m.product.name}</td>
                      <td className="px-6 py-3.5 text-gray-500">{m.area || "—"}</td>
                      <td className="px-6 py-3.5 text-center font-semibold text-gray-700">{m.quantity} {m.product.unit}</td>
                      <td className="px-6 py-3.5 text-right text-gray-700">₹{unitCost.toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-right font-extrabold text-gray-900">₹{(m.quantity * unitCost).toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs max-w-[150px] truncate">{m.notes || "—"}</td>
                      <td className="px-6 py-3.5 text-right">
                        <DeleteMaterialButton id={m.id} projectId={id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-12 text-center text-gray-400">
              <Package size={36} className="mx-auto mb-2 opacity-30" />
              <p>No materials added yet. Click <strong>Add Material</strong> to get started.</p>
            </div>
          )}
        </div>

        {/* Cost Summary Banner */}
        {project.materialUsages.length > 0 && (
          <div className="px-4 sm:px-6 py-3.5 border-t border-gray-100 bg-gray-50/80 flex justify-between sm:justify-end items-center gap-3">
            <span className="text-xs sm:text-sm font-semibold text-gray-600">Total Material Cost:</span>
            <span className="text-base sm:text-xl font-extrabold text-primary">₹{totalCost.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

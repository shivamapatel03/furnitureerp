import { getMaterialUsages } from "@/app/actions/material-usage";
import { format } from "date-fns";
import Link from "next/link";
import { Plus, Hammer, Package } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function MaterialUsagePage() {
  const usages = await getMaterialUsages();

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Material Usage</h1>
          <p className="text-xs sm:text-sm text-gray-500">Track material logs and site consumption</p>
        </div>
        <Link 
          href="/material-usage/new" 
          className="bg-primary hover:bg-primary-dark active:scale-98 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Log Usage
        </Link>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {usages.length > 0 ? (
            usages.map(usage => (
              <div key={usage.id} className="p-4 space-y-1.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{usage.product.name}</h3>
                    <p className="text-xs font-semibold text-primary">{usage.project.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-gray-900 text-sm">{usage.quantity} {usage.product.unit}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
                  <span>{usage.area ? `Area: ${usage.area}` : "General"}</span>
                  <span>{format(new Date(usage.date), 'dd MMM yyyy')}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400">
              <Hammer className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">No material usage logged</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Record items sent or consumed at project sites.</p>
              <Link href="/material-usage/new" className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1">
                <Plus size={16} /> Log Usage
              </Link>
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Project Site</th>
                <th className="px-6 py-3.5">Area / Location</th>
                <th className="px-6 py-3.5">Material</th>
                <th className="px-6 py-3.5 text-right">Quantity Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {usages.map(usage => (
                <tr key={usage.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {format(new Date(usage.date), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{usage.project.name}</td>
                  <td className="px-6 py-4 text-gray-600">{usage.area || '-'}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{usage.product.name}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-extrabold text-gray-900">{usage.quantity}</span> <span className="text-gray-400 text-xs">{usage.product.unit}</span>
                  </td>
                </tr>
              ))}
              {usages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Hammer className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-bold text-gray-900">No material usage recorded yet</p>
                      <Link href="/material-usage/new" className="text-primary font-semibold hover:underline text-sm mt-2">
                        Log First Material Usage →
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

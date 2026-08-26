import { getDashboardData } from "@/app/actions/dashboard";
import { format } from "date-fns";
import { BarChart3, AlertTriangle, IndianRupee, FileText } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const data = await getDashboardData();
  
  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Reports & Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Financial summary & inventory health</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs p-4 sm:p-6 space-y-6 transition-colors">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100 mb-3 border-b border-gray-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <IndianRupee size={18} className="text-primary" />
            Financial Summary ({format(new Date(), 'MMMM yyyy')})
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 bg-gray-50/80 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/60">
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Total Month Sales</p>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-slate-100">₹{data.monthSales.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50/80 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/60">
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Invoices Generated</p>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-slate-100">{data.totalBillsCount}</p>
            </div>
            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/50">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Pending Receivables</p>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-700 dark:text-amber-300">₹{data.pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100 mb-3 border-b border-gray-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
            Inventory Stock Alerts
          </h2>
          
          {data.lowStockProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold">
                    <th className="px-4 py-2.5">Product Name</th>
                    <th className="px-4 py-2.5 font-semibold">Stock</th>
                    <th className="px-4 py-2.5">Min Limit</th>
                    <th className="px-4 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {data.lowStockProducts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-slate-100">{p.name}</td>
                      <td className="px-4 py-3 font-extrabold text-red-600 dark:text-red-400">{p.stock} {p.unit}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs">{p.lowStockLimit} {p.unit}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full">
                          Reorder
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/60 p-4 rounded-xl">
              All inventory items have sufficient stock above warning thresholds.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

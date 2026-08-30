import { getBills } from "@/app/actions/billing";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, FileText, IndianRupee, Edit } from "lucide-react";
import PrintActionButton from "./PrintActionButton";
import DeleteBillButton from "./DeleteBillButton";
import BillSearchInput from "./BillSearchInput";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default async function BillingPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams.q ?? "";
  const bills = await getBills(query || undefined);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Billing & Invoices</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Generate bills and track customer payments</p>
        </div>
        <Link 
          href="/billing/new" 
          className="bg-primary hover:bg-primary-dark active:scale-98 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Create Bill
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {/* Search Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/40">
          <Suspense fallback={<div className="h-10 w-full bg-gray-200 dark:bg-slate-800 animate-pulse rounded-lg" />}>
            <BillSearchInput />
          </Suspense>
        </div>

        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-gray-100 dark:divide-slate-800">
          {bills.length > 0 ? (
            bills.map(bill => (
              <div key={bill.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-900 dark:text-slate-100 text-sm">{bill.billNumber}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    bill.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400' :
                    bill.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                  }`}>
                    {bill.paymentStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 dark:text-slate-200">{bill.customer.name}</p>
                      {bill.category && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                          {bill.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{bill.customer.mobile}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-gray-900 dark:text-slate-100 text-base">₹{bill.grandTotal.toLocaleString()}</p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500">{format(new Date(bill.date), 'dd MMM yyyy')}</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end items-center gap-2 border-t border-gray-50 dark:border-slate-800">
                  <Link
                    href={`/billing/${bill.id}/edit`}
                    className="p-2 text-gray-600 dark:text-slate-400 hover:text-primary rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Edit Bill"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </Link>
                  <PrintActionButton billId={bill.id} />
                  <DeleteBillButton billId={bill.id} billNumber={bill.billNumber} />
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-slate-400">
              <FileText className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-base font-bold text-gray-900 dark:text-slate-100">No bills found</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 mb-4">Create your first invoice to get started.</p>
              <Link href="/billing/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold">
                <Plus size={16} /> Create Bill
              </Link>
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold tracking-wider">
                <th className="px-6 py-3.5">Bill No.</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Customer / Category</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
              {bills.length > 0 ? (
                bills.map(bill => (
                  <tr key={bill.id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-slate-100">{bill.billNumber}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400 text-xs">{format(new Date(bill.date), 'dd MMM yyyy')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 dark:text-slate-200">{bill.customer.name}</p>
                        {bill.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                            {bill.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-slate-500">{bill.customer.mobile}</p>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-right text-gray-900 dark:text-slate-100">₹{bill.grandTotal.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        bill.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400' :
                        bill.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                      }`}>
                        {bill.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/billing/${bill.id}/edit`}
                          className="p-2 text-gray-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit Bill"
                        >
                          <Edit size={16} />
                        </Link>
                        <PrintActionButton billId={bill.id} />
                        <DeleteBillButton billId={bill.id} billNumber={bill.billNumber} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <IndianRupee className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
                      <p className="text-base font-bold text-gray-900 dark:text-slate-100">No bills generated yet</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 mb-4">Start creating bills for your customers.</p>
                      <Link href="/billing/new" className="text-primary font-semibold hover:underline text-sm">
                        Create New Bill →
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

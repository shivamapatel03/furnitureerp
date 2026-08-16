import { getBills } from "@/app/actions/billing";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, FileText, IndianRupee } from "lucide-react";
import PrintActionButton from "./PrintActionButton";
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Billing History</h1>
          <p className="text-xs sm:text-sm text-gray-500">Invoices & customer transactions</p>
        </div>
        <Link 
          href="/billing/new" 
          className="bg-primary hover:bg-primary-dark active:scale-98 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Create New Bill
        </Link>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Search Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
          <Suspense fallback={<div className="h-10 w-full bg-gray-200 animate-pulse rounded-lg" />}>
            <BillSearchInput />
          </Suspense>
        </div>

        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {bills.length > 0 ? (
            bills.map(bill => (
              <div key={bill.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-gray-900 text-sm">{bill.billNumber}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    bill.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                    bill.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {bill.paymentStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-gray-800">{bill.customer.name}</p>
                    <p className="text-xs text-gray-400">{bill.customer.mobile}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-gray-900 text-base">₹{bill.grandTotal.toLocaleString()}</p>
                    <p className="text-[11px] text-gray-400">{format(new Date(bill.date), 'dd MMM yyyy')}</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end items-center border-t border-gray-50">
                  <PrintActionButton billId={bill.id} />
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-bold text-gray-900">No bills found</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Create your first invoice to get started.</p>
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
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                <th className="px-6 py-3.5">Bill No.</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {bills.length > 0 ? (
                bills.map(bill => (
                  <tr key={bill.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{bill.billNumber}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{format(new Date(bill.date), 'dd MMM yyyy')}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{bill.customer.name}</p>
                      <p className="text-xs text-gray-400">{bill.customer.mobile}</p>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-right text-gray-900">₹{bill.grandTotal.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        bill.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                        bill.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {bill.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PrintActionButton billId={bill.id} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-bold text-gray-900">No bills found</p>
                      <p className="text-xs text-gray-400 mt-1 mb-4">Create your first invoice to get started.</p>
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

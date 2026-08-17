import { getCustomers } from "@/app/actions/customers";
import { format } from "date-fns";
import { Users, Phone, Receipt } from "lucide-react";
import CustomerSearchInput from "./CustomerSearchInput";
import { Suspense } from "react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CustomersPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams.q ?? "";
  const customers = await getCustomers(query || undefined);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Directory</h1>
          <p className="text-xs sm:text-sm text-gray-500">Auto-created from customer billing records</p>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Search Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
          <Suspense fallback={<div className="h-10 w-full max-w-md bg-gray-200 animate-pulse rounded-xl" />}>
            <CustomerSearchInput />
          </Suspense>
          <span className="text-xs font-semibold text-gray-400 hidden sm:inline">
            {customers.length} {customers.length === 1 ? "customer" : "customers"} found
          </span>
        </div>

        {/* Mobile View: Cards */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {customers.length > 0 ? (
            customers.map(customer => (
              <div key={customer.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{customer.name}</h3>
                    <a 
                      href={`tel:${customer.mobile}`}
                      className="text-xs text-primary font-semibold flex items-center gap-1 mt-0.5"
                    >
                      <Phone size={12} /> {customer.mobile}
                    </a>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Total Purchased</span>
                    <span className="font-extrabold text-gray-900 text-sm">₹{customer.totalPurchased.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Receipt size={13} className="text-gray-400" />
                    <span className="font-semibold text-gray-700">{customer._count.bills}</span> bills generated
                  </span>
                  <span>Active {format(new Date(customer.updatedAt), 'dd MMM yyyy')}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">
                {query ? `No customers matching "${query}"` : "No customer records"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {query ? (
                  <Link href="/customers" className="text-primary font-semibold hover:underline">
                    Clear search filter
                  </Link>
                ) : (
                  "Customers will automatically appear as you generate invoices."
                )}
              </p>
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                <th className="px-6 py-3.5">Customer Name</th>
                <th className="px-6 py-3.5">Mobile Number</th>
                <th className="px-6 py-3.5 text-center">Total Bills</th>
                <th className="px-6 py-3.5 text-right">Total Purchased</th>
                <th className="px-6 py-3.5">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{customer.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <a href={`tel:${customer.mobile}`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                      <Phone size={13} className="text-gray-400" />
                      {customer.mobile}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                      {customer._count.bills}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-gray-900">
                    ₹{customer.totalPurchased.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {format(new Date(customer.updatedAt), 'dd MMM yyyy')}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-bold text-gray-900">
                        {query ? `No customers matching "${query}"` : "No customers found"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {query ? (
                          <Link href="/customers" className="text-primary font-semibold hover:underline">
                            Clear search filter
                          </Link>
                        ) : (
                          "Customers are auto-saved when you create invoices."
                        )}
                      </p>
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

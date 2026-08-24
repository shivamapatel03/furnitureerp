import { getDashboardData } from "../actions/dashboard";
import { CreditCard, IndianRupee, Package, ReceiptText, AlertTriangle, ArrowRight, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500">Business overview & quick metrics</p>
        </div>
        <div className="flex items-center gap-2">

          <Link 
            href="/billing/new" 
            className="bg-primary hover:bg-primary-dark active:scale-98 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus size={18} />
            Create Bill
          </Link>
        </div>
      </div>

      {/* KPI Cards: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className="bg-white p-3.5 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-500 font-medium truncate">Today's Sales</span>
            <div className="p-1.5 sm:p-2 bg-green-50 text-green-600 rounded-lg shrink-0">
              <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
              ₹{data.todaySales.toLocaleString()}
            </p>
            <p className="text-[11px] text-green-600 font-medium mt-0.5">Recorded today</p>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white p-3.5 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-500 font-medium truncate">This Month</span>
            <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
              ₹{data.monthSales.toLocaleString()}
            </p>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">Monthly revenue</p>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-3.5 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-500 font-medium truncate">Pending</span>
            <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-amber-600 tracking-tight">
              ₹{data.pendingAmount.toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate">From {data.totalBillsCount} bills</p>
          </div>
        </div>

        {/* Inventory / Customers */}
        <div className="bg-white p-3.5 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-500 font-medium truncate">Products</span>
            <div className="p-1.5 sm:p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
              {data.totalProducts}
            </p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate">{data.totalCustomers} Customers</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Bills & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Bills Card */}
        <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">Recent Bills</h3>
            <Link href="/billing" className="text-xs sm:text-sm text-primary font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Card List (< sm screens) */}
          <div className="block sm:hidden divide-y divide-gray-100">
            {data.recentBills.length > 0 ? (
              data.recentBills.map(bill => (
                <div key={bill.id} className="p-3.5 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-xs">{bill.billNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        bill.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                        bill.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {bill.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium truncate">{bill.customer.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{format(new Date(bill.date), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-gray-900 text-sm">₹{bill.grandTotal.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <ReceiptText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">No bills generated yet</p>
                <Link href="/billing/new" className="text-xs text-primary font-semibold mt-1 inline-block">
                  + Create first bill
                </Link>
              </div>
            )}
          </div>

          {/* Desktop/Tablet Table (sm+ screens) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3">Bill No.</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {data.recentBills.length > 0 ? (
                  data.recentBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-gray-900">{bill.billNumber}</td>
                      <td className="px-6 py-3.5 text-gray-600 font-medium">{bill.customer.name}</td>
                      <td className="px-6 py-3.5 font-extrabold text-gray-900">₹{bill.grandTotal.toLocaleString()}</td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          bill.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                          bill.paymentStatus === 'PARTIAL' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {bill.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">{format(new Date(bill.date), 'dd MMM yyyy')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      No recent bills found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Card */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 sm:px-6 py-3.5 border-b border-gray-100 flex justify-between items-center bg-red-50/40">
            <h3 className="font-bold text-red-700 flex items-center gap-1.5 text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Low Stock Alerts
            </h3>
            <Link href="/products" className="text-xs sm:text-sm text-red-600 font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-80">
            {data.lowStockProducts.length > 0 ? (
              data.lowStockProducts.map(product => (
                <div key={product.id} className="p-3.5 sm:px-6 sm:py-4 flex justify-between items-center hover:bg-gray-50/60 transition-colors">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">Min limit: {product.lowStockLimit} {product.unit}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md font-extrabold text-sm">
                      {product.stock} {product.unit}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <Package className="w-9 h-9 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-600">Stock is healthy</p>
                <p className="text-xs text-gray-400 mt-0.5">No products below warning limits.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

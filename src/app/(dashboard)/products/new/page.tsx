import { createProduct } from "@/app/actions/products";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/products" className="p-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Add New Product</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Add materials or items to inventory</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs p-4 sm:p-6 transition-colors">
        <form action={createProduct} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Product / Material Name *</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                placeholder="e.g. Plywood 18mm Commercial" 
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Category</label>
              <input 
                type="text" 
                id="category" 
                name="category" 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                placeholder="e.g. Wood, Hardware, Laminate" 
              />
            </div>

            <div>
              <label htmlFor="unit" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Unit of Measure</label>
              <input 
                type="text" 
                id="unit" 
                name="unit" 
                defaultValue="Pcs"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                placeholder="Sheet, Pcs, Box, Kg" 
              />
            </div>

            <div>
              <label htmlFor="purchasePrice" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Purchase / Cost Price (₹)</label>
              <input 
                type="number" 
                step="any" 
                id="purchasePrice" 
                name="purchasePrice" 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                placeholder="0.00" 
              />
            </div>

            <div>
              <label htmlFor="sellingPrice" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Selling Price (₹) *</label>
              <input 
                type="number" 
                step="any" 
                id="sellingPrice" 
                name="sellingPrice" 
                required 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                placeholder="0.00" 
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Initial Stock</label>
              <input 
                type="number" 
                step="any"
                id="stock" 
                name="stock" 
                defaultValue="0" 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
              />
            </div>

            <div>
              <label htmlFor="lowStockLimit" className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Low Stock Warning Limit</label>
              <input 
                type="number" 
                step="any"
                id="lowStockLimit" 
                name="lowStockLimit" 
                defaultValue="10" 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 border-t border-gray-100 dark:border-slate-800">
            <Link 
              href="/products" 
              className="w-full sm:w-auto px-5 py-2.5 text-center text-sm font-semibold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 active:scale-98 rounded-lg transition-all"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark active:scale-98 rounded-lg transition-all shadow-sm"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

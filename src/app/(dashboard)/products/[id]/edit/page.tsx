import { getProducts, updateProduct } from "@/app/actions/products";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const allProducts = await getProducts();
  const product = allProducts.find(p => p.id === id);

  if (!product) notFound();

  const action = updateProduct.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/products" className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-xs sm:text-sm text-gray-500">Update product details and stock</p>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6">
        <form action={action} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-1">Product Name *</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                defaultValue={product.name} 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <input 
                type="text" 
                id="category" 
                name="category" 
                defaultValue={product.category ?? ""} 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
              />
            </div>

            <div>
              <label htmlFor="unit" className="block text-xs font-semibold text-gray-700 mb-1">Unit of Measure</label>
              <input 
                type="text" 
                id="unit" 
                name="unit" 
                defaultValue={product.unit} 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
              />
            </div>

            <div>
              <label htmlFor="purchasePrice" className="block text-xs font-semibold text-gray-700 mb-1">Purchase Price (₹)</label>
              <input 
                type="number" 
                step="any" 
                id="purchasePrice" 
                name="purchasePrice" 
                defaultValue={product.purchasePrice ?? ""} 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
              />
            </div>

            <div>
              <label htmlFor="sellingPrice" className="block text-xs font-semibold text-gray-700 mb-1">Selling Price (₹) *</label>
              <input 
                type="number" 
                step="any" 
                id="sellingPrice" 
                name="sellingPrice" 
                required 
                defaultValue={product.sellingPrice} 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-xs font-semibold text-gray-700 mb-1">Current Stock</label>
              <input 
                type="number" 
                step="any"
                id="stock" 
                name="stock" 
                defaultValue={product.stock} 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
              />
            </div>

            <div>
              <label htmlFor="lowStockLimit" className="block text-xs font-semibold text-gray-700 mb-1">Low Stock Warning Limit</label>
              <input 
                type="number" 
                step="any"
                id="lowStockLimit" 
                name="lowStockLimit" 
                defaultValue={product.lowStockLimit} 
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 border-t border-gray-100">
            <Link 
              href="/products" 
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

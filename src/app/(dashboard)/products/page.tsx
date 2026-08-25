import { getProducts } from "@/app/actions/products";
import Link from "next/link";
import { Plus, Edit, Package } from "lucide-react";
import ProductSearchInput from "./ProductSearchInput";
import DeleteProductButton from "./DeleteProductButton";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default async function ProductsPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams.q ?? "";
  const products = await getProducts(query || undefined);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products & Inventory</h1>
          <p className="text-xs sm:text-sm text-gray-500">Track stock levels and catalog prices</p>
        </div>
        <Link 
          href="/products/new"
          className="bg-primary hover:bg-primary-dark active:scale-98 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Search Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-gray-100 bg-gray-50/60">
          <Suspense fallback={<div className="h-10 w-full bg-gray-200 animate-pulse rounded-lg" />}>
            <ProductSearchInput />
          </Suspense>
        </div>

        {/* Mobile View: Product Cards */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {products.length > 0 ? (
            products.map(product => (
              <div key={product.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug">{product.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{product.category || "General"}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                    product.stock <= product.lowStockLimit
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {product.stock <= product.lowStockLimit ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Selling Price</span>
                    <span className="font-extrabold text-gray-900 text-sm">₹{product.sellingPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Current Stock</span>
                    <span className="font-bold text-gray-900 text-sm">{product.stock} {product.unit}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-gray-50">
                  <span className="text-[11px] text-gray-400">Min limit: {product.lowStockLimit} {product.unit}</span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="p-2 text-gray-600 active:text-primary active:bg-primary/10 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                      title="Edit product"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-bold text-gray-900">No products found</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Add your first material or product.</p>
              <Link href="/products/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold">
                <Plus size={16} /> Add Product
              </Link>
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                <th className="px-6 py-3.5">Product Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Current Stock</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-gray-500">{product.category || '-'}</td>
                  <td className="px-6 py-4 text-gray-900 font-extrabold">₹{product.sellingPrice.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900">{product.stock}</span> <span className="text-gray-500 text-xs">{product.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    {product.stock <= product.lowStockLimit ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit size={16} />
                      </Link>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-base font-bold text-gray-900">No products found</p>
                      <p className="text-xs text-gray-400 mt-1 mb-4">Add your first material or product to manage inventory.</p>
                      <Link href="/products/new" className="text-primary font-semibold hover:underline text-sm">
                        Add New Product →
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

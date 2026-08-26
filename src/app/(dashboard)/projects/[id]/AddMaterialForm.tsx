"use client";

import { useState, useTransition } from "react";
import { addMaterialToProject } from "@/app/actions/projects";
import { Plus, Search, X } from "lucide-react";

type Product = { id: string; name: string; unit: string; sellingPrice: number };

export default function AddMaterialForm({ projectId, products }: { projectId: string; products: Product[] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;
    startTransition(async () => {
      await addMaterialToProject(projectId, {
        productId: selectedProduct.id,
        quantity: parseFloat(quantity) || 1,
        area,
        notes,
      });
      // Reset form
      setSearch("");
      setSelectedProduct(null);
      setQuantity("1");
      setArea("");
      setNotes("");
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark active:scale-95 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold transition-all text-xs sm:text-sm shadow-xs"
      >
        <Plus size={16} />
        Add Material
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50/90 dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 space-y-3.5 mt-3 transition-colors">
      <div className="flex justify-between items-center border-b border-gray-200/80 dark:border-slate-700 pb-2">
        <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm">Add Material / Product Usage</h3>
        <button 
          type="button" 
          onClick={() => setOpen(false)} 
          className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-1 rounded-lg"
        >
          <X size={18} />
        </button>
      </div>

      {/* Product search */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">Select Product *</label>
        {selectedProduct ? (
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-primary rounded-xl">
            <div>
              <span className="font-bold text-gray-900 dark:text-slate-100 text-sm">{selectedProduct.name}</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 ml-2">({selectedProduct.unit})</span>
            </div>
            <button 
              type="button" 
              onClick={() => { setSelectedProduct(null); setSearch(""); }} 
              className="text-xs font-bold text-red-600 hover:underline px-2 py-1 bg-red-50 dark:bg-red-950/50 rounded-lg"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Type to search materials/products..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
            />
            {search && (
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
                {filtered.length > 0 ? filtered.map(p => (
                  <button 
                    key={p.id} 
                    type="button"
                    onClick={() => { setSelectedProduct(p); setSearch(""); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 flex justify-between items-center text-sm active:bg-gray-100 dark:active:bg-slate-700"
                  >
                    <span className="font-semibold text-gray-900 dark:text-slate-100">{p.name}</span>
                    <span className="text-gray-400 dark:text-slate-500 text-xs">{p.unit} · ₹{p.sellingPrice}</span>
                  </button>
                )) : (
                  <p className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs">No matching products found</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
            Quantity {selectedProduct && <span className="text-gray-400 dark:text-slate-500">({selectedProduct.unit})</span>} *
          </label>
          <input
            type="number" 
            step="any" 
            min="0.01" 
            required
            value={quantity} 
            onChange={e => setQuantity(e.target.value)}
            placeholder="1"
            className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Area / Room</label>
          <input
            type="text" 
            value={area} 
            onChange={e => setArea(e.target.value)}
            placeholder="e.g. Kitchen, Master Bedroom"
            className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Notes / Instructions</label>
        <input
          type="text" 
          value={notes} 
          onChange={e => setNotes(e.target.value)}
          placeholder="Optional notes..."
          className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
        />
      </div>

      <div className="flex justify-end gap-2.5 pt-1">
        <button 
          type="button" 
          onClick={() => setOpen(false)} 
          className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={!selectedProduct || isPending} 
          className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark active:scale-95 rounded-lg transition-all disabled:opacity-50 shadow-xs"
        >
          {isPending ? "Adding…" : "Add Material"}
        </button>
      </div>
    </form>
  );
}

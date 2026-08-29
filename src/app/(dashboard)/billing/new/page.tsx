"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProducts } from "@/app/actions/products";
import { createBill } from "@/app/actions/billing";
import { getSettings } from "@/app/actions/settings";
import { Plus, Trash2, CheckCircle2, FileText, ArrowLeft, Ruler, Package, Home, Utensils, Building, Hotel, Store, Edit3 } from "lucide-react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  category?: string | null;
  sellingPrice: number;
  stock: number;
  unit: string;
};

type BillItem = {
  id: string;
  productId: string;
  calculationType: "UNIT" | "SQFT";
  quantity: number;
  price: number;
  total: number;
  sqft?: number;
  ratePerSqft?: number;
  lengthFt?: number;
  heightFt?: number;
};

const PRESET_CATEGORIES = [
  { id: "House", label: "House / Residential", icon: Home },
  { id: "Restaurant", label: "Restaurant / Cafe", icon: Utensils },
  { id: "Office", label: "Office / Commercial", icon: Building },
  { id: "Hotel", label: "Hotel / Resort", icon: Hotel },
  { id: "Showroom", label: "Showroom / Retail", icon: Store },
  { id: "Other", label: "Other (Custom)", icon: Edit3 },
] as const;

export default function NewBillPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [defaultSqftRate, setDefaultSqftRate] = useState<number>(850);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ id: string } | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  
  // Category / Furniture Usage
  const [categoryType, setCategoryType] = useState<string>("House");
  const [customCategory, setCustomCategory] = useState("");

  const [items, setItems] = useState<BillItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "PARTIAL" | "PENDING">("PAID");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "BANK_TRANSFER" | "CARD">("CASH");
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    Promise.all([getProducts(), getSettings()]).then(([prods, settings]) => {
      setProducts(prods);
      if (settings.defaultSqftRate) {
        const rate = parseFloat(settings.defaultSqftRate);
        if (!isNaN(rate) && rate > 0) {
          setDefaultSqftRate(rate);
        }
      }
      setLoading(false);
    });
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const grandTotal = Math.max(0, subtotal - discount + tax);

  useEffect(() => {
    if (paymentStatus === "PAID") {
      setPaidAmount(grandTotal);
    } else if (paymentStatus === "PENDING") {
      setPaidAmount(0);
    }
  }, [paymentStatus, grandTotal]);

  const addItem = (type: "UNIT" | "SQFT" = "UNIT") => {
    setItems([
      ...items,
      {
        id: Math.random().toString(),
        productId: "",
        calculationType: type,
        quantity: 1,
        price: type === "SQFT" ? defaultSqftRate : 0,
        sqft: type === "SQFT" ? 10 : undefined,
        ratePerSqft: type === "SQFT" ? defaultSqftRate : undefined,
        total: type === "SQFT" ? 10 * defaultSqftRate : 0,
      }
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof BillItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        if (field === "productId") {
          const product = products.find(p => p.id === value);
          if (product) {
            if (updated.calculationType === "UNIT") {
              updated.price = product.sellingPrice;
              updated.total = (updated.quantity || 0) * updated.price;
            } else {
              // In SQFT mode, keep custom SQFT rate or product selling price as rate
              if (!updated.ratePerSqft) {
                updated.ratePerSqft = defaultSqftRate;
              }
              const sq = updated.sqft || 0;
              const rate = updated.ratePerSqft || 0;
              updated.quantity = 1;
              updated.price = rate;
              updated.total = sq * rate;
            }
          }
        } else if (field === "calculationType") {
          const newType = value as "UNIT" | "SQFT";
          updated.calculationType = newType;
          if (newType === "SQFT") {
            updated.sqft = updated.sqft || 10;
            updated.ratePerSqft = updated.ratePerSqft || defaultSqftRate;
            updated.quantity = 1;
            updated.price = updated.ratePerSqft;
            updated.total = (updated.sqft || 10) * (updated.ratePerSqft || defaultSqftRate);
          } else {
            const product = products.find(p => p.id === updated.productId);
            updated.price = product ? product.sellingPrice : (updated.price || 0);
            updated.total = (updated.quantity || 1) * updated.price;
          }
        } else if (field === "quantity" || field === "price") {
          if (updated.calculationType === "UNIT") {
            const qty = field === "quantity" ? value : updated.quantity;
            const prc = field === "price" ? value : updated.price;
            updated.total = (qty || 0) * (prc || 0);
          }
        } else if (field === "sqft" || field === "ratePerSqft") {
          const sq = field === "sqft" ? value : (updated.sqft || 0);
          const rate = field === "ratePerSqft" ? value : (updated.ratePerSqft || 0);
          updated.quantity = 1;
          updated.sqft = sq;
          updated.ratePerSqft = rate;
          updated.price = rate;
          updated.total = (sq || 0) * (rate || 0);
        } else if (field === "lengthFt" || field === "heightFt") {
          const len = field === "lengthFt" ? value : (updated.lengthFt || 0);
          const ht = field === "heightFt" ? value : (updated.heightFt || 0);
          if (len > 0 && ht > 0) {
            const calculatedSqft = Math.round(len * ht * 100) / 100;
            updated.sqft = calculatedSqft;
            const rate = updated.ratePerSqft || defaultSqftRate;
            updated.quantity = 1;
            updated.price = rate;
            updated.total = calculatedSqft * rate;
          }
        }
        
        return updated;
      }
      return item;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || items.some(i => !i.productId)) {
      alert("Please add at least one valid product");
      return;
    }

    const finalCategory = categoryType === "Other"
      ? (customCategory.trim() || "Custom Furniture Project")
      : (PRESET_CATEGORIES.find(c => c.id === categoryType)?.label || categoryType);

    setSubmitting(true);
    const result = await createBill({
      customerName,
      customerMobile,
      category: finalCategory,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.calculationType === "SQFT" ? (i.ratePerSqft || i.price) : i.price,
        total: i.total,
        calculationType: i.calculationType,
        sqft: i.calculationType === "SQFT" ? i.sqft : undefined,
        ratePerSqft: i.calculationType === "SQFT" ? i.ratePerSqft : undefined,
      })),
      subtotal,
      discount,
      tax,
      grandTotal,
      paymentStatus,
      paymentMethod,
      paidAmount,
      notes: notes.trim() || undefined
    });

    setSubmitting(false);

    if (result.success && result.billId) {
      router.push(`/billing/${result.billId}/print`);
    } else {
      alert(result.error || "Failed to create bill");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
        <p className="text-sm font-medium">Loading products & settings...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto my-6 sm:my-12 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm text-center transition-colors">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Bill Created Successfully</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mb-6">The invoice is generated and stock has been updated.</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link 
            href={`/billing/${success.id}/print`}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark active:scale-98 text-white px-5 py-3 rounded-lg font-semibold text-sm transition-all shadow-sm"
          >
            <FileText size={18} />
            View & Download Invoice
          </Link>
          <button
            onClick={() => {
              setSuccess(null);
              setCustomerName("");
              setCustomerMobile("");
              setItems([]);
              setDiscount(0);
              setTax(0);
              setPaymentStatus("PAID");
              setNotes("");
            }}
            className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 active:scale-98 text-gray-700 dark:text-slate-300 px-5 py-3 rounded-lg font-semibold text-sm transition-all"
          >
            <Plus size={18} />
            Create Another Bill
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/billing" className="p-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">Create New Bill</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Fast invoice generator with Sqft & Unit calculations</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Customer & Usage Category Card */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs transition-colors space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100 border-b border-gray-100 dark:border-slate-800 pb-2">
            Customer & Project Purpose
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer full name"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          {/* Furniture Category / Purpose Selection */}
          <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Furniture Usage / Project Category:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {PRESET_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = categoryType === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategoryType(cat.id)}
                    className={`p-2.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all border ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-xs"
                        : "bg-gray-50 dark:bg-slate-800/70 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-center truncate w-full">{cat.label.split('/')[0]}</span>
                  </button>
                );
              })}
            </div>

            {categoryType === "Other" && (
              <div className="mt-3 animate-in fade-in">
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">
                  Specify Custom Furniture Usage / Scope:
                </label>
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Penthouse Terrace Lounge, Dental Clinic Setup, Farmhouse Dining..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Products & Sqft Items Card */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-gray-100 dark:border-slate-800 pb-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100">Products & Furniture Items</h2>
              <p className="text-[11px] text-gray-400 dark:text-slate-500">
                Default Sqft Base Rate: <span className="font-bold text-primary">₹{defaultSqftRate}/sqft</span> (editable in Settings)
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => addItem("UNIT")}
                className="text-primary active:scale-95 font-semibold flex items-center gap-1 text-xs bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 px-3 py-1.5 rounded-xl transition-all"
              >
                <Package size={15} /> + Add Standard (Pcs)
              </button>
              <button
                type="button"
                onClick={() => addItem("SQFT")}
                className="text-emerald-700 dark:text-emerald-300 active:scale-95 font-semibold flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl transition-all"
              >
                <Ruler size={15} /> + Add Sqft Item
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 px-4 text-gray-500 dark:text-slate-400 bg-gray-50/70 dark:bg-slate-800/40 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">No items added yet</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 mb-3">Add standard inventory items or calculate custom furniture by square feet.</p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => addItem("UNIT")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  <Package size={14} /> Add Standard Item
                </button>
                <button
                  type="button"
                  onClick={() => addItem("SQFT")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                >
                  <Ruler size={14} /> Add Sqft Item
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => {
                const isSqft = item.calculationType === "SQFT";
                return (
                  <div 
                    key={item.id} 
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSqft 
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60" 
                        : "bg-gray-50/80 dark:bg-slate-800/50 border-gray-200/70 dark:border-slate-700/60"
                    }`}
                  >
                    {/* Item Top Row: Calculation Type Pill + Delete */}
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-gray-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 dark:text-slate-400">#{index + 1}</span>
                        <div className="inline-flex rounded-lg p-0.5 bg-gray-200/70 dark:bg-slate-800">
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, "calculationType", "UNIT")}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-all ${
                              !isSqft
                                ? "bg-white dark:bg-slate-900 text-primary shadow-xs"
                                : "text-gray-600 dark:text-slate-400 hover:text-gray-900"
                            }`}
                          >
                            <Package size={12} /> Standard (Pcs)
                          </button>
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, "calculationType", "SQFT")}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-all ${
                              isSqft
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-gray-600 dark:text-slate-400 hover:text-gray-900"
                            }`}
                          >
                            <Ruler size={12} /> Sq. Feet (Sqft)
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 active:bg-red-100 dark:active:bg-red-950/40 p-1.5 rounded-lg flex items-center gap-1 text-xs font-semibold"
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                        <span className="text-xs">Remove</span>
                      </button>
                    </div>

                    {/* Form Controls Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      {/* Product Selection */}
                      <div className="md:col-span-5">
                        <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-300 mb-1">
                          Product / Item Name *
                        </label>
                        <select
                          required
                          value={item.productId}
                          onChange={(e) => updateItem(item.id, "productId", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none"
                        >
                          <option value="" className="text-gray-500 dark:text-slate-400">Select product...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id} className="text-gray-900 dark:text-slate-100 dark:bg-slate-900">
                              {p.name} {p.category ? `(${p.category})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      {isSqft ? (
                        <>
                          {/* Square Feet Input */}
                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                              Area (Sq. Ft) *
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                required
                                min="0.1"
                                step="any"
                                value={item.sqft || ""}
                                onChange={(e) => updateItem(item.id, "sqft", parseFloat(e.target.value) || 0)}
                                placeholder="e.g. 45"
                                className="w-full pl-2.5 pr-10 py-2 border border-emerald-300 dark:border-emerald-700/70 rounded-lg text-sm font-bold bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                              <span className="absolute right-2.5 top-2.5 text-[10px] font-bold text-gray-400">sqft</span>
                            </div>
                          </div>

                          {/* Rate Per Sqft */}
                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                              Rate (₹ / sqft) *
                            </label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-xs font-bold text-gray-400">₹</span>
                              <input
                                type="number"
                                required
                                min="1"
                                step="any"
                                value={item.ratePerSqft || ""}
                                onChange={(e) => updateItem(item.id, "ratePerSqft", parseFloat(e.target.value) || 0)}
                                placeholder="850"
                                className="w-full pl-6 pr-2.5 py-2 border border-emerald-300 dark:border-emerald-700/70 rounded-lg text-sm font-bold bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>
                          </div>

                          {/* Total */}
                          <div className="md:col-span-3 text-right">
                            <span className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1">
                              Total ({item.sqft || 0} sqft × ₹{item.ratePerSqft || 0})
                            </span>
                            <p className="font-extrabold text-emerald-700 dark:text-emerald-400 text-base py-1">
                              ₹{item.total.toLocaleString()}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Standard Quantity */}
                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">Quantity</label>
                            <input
                              type="number"
                              required
                              min="0.1"
                              step="any"
                              value={item.quantity || ""}
                              onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                              placeholder="1"
                              className="w-full px-2.5 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>

                          {/* Unit Price */}
                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">Price (₹)</label>
                            <input
                              type="number"
                              required
                              min="0"
                              step="any"
                              value={item.price || ""}
                              onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full px-2.5 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>

                          {/* Total */}
                          <div className="md:col-span-3 text-right">
                            <span className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 mb-1">Total</span>
                            <p className="font-extrabold text-gray-900 dark:text-slate-100 text-base py-1">
                              ₹{item.total.toLocaleString()}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment & Bill Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Payment Card */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs space-y-3.5 transition-colors">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100 border-b border-gray-100 dark:border-slate-800 pb-2">
              Payment Mode & Status
            </h2>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5">Payment Status</label>
              <div className="grid grid-cols-3 gap-2">
                {(["PAID", "PARTIAL", "PENDING"] as const).map((status) => (
                  <button
                    type="button"
                    key={status}
                    onClick={() => setPaymentStatus(status)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border ${
                      paymentStatus === status
                        ? status === 'PAID'
                          ? 'bg-green-600 text-white border-green-600 shadow-xs'
                          : status === 'PARTIAL'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                <option value="CARD">Debit / Credit Card</option>
              </select>
            </div>

            {paymentStatus === "PARTIAL" && (
              <div className="pt-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Paid Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={paidAmount || ""}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Amount received"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                Bill Notes / Remarks (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 5-year warranty included, delivery within 7 days, special custom finish..."
                className="w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none resize-none"
              />
            </div>
          </div>

          {/* Bill Summary Card */}
          <div className="bg-gray-50 dark:bg-slate-900/90 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 transition-colors">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-slate-100 mb-3 border-b border-gray-200/80 dark:border-slate-800 pb-2">
                Bill Summary
              </h2>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Discount (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={discount || ""}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-28 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg text-right bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-800">
                  <span>Tax / GST (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={tax || ""}
                    onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-28 px-2.5 py-1.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg text-right bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3">
                <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100">Grand Total</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-primary">₹{grandTotal.toLocaleString()}</span>
              </div>
              
              {paymentStatus === "PARTIAL" && (
                <div className="flex justify-between items-center text-amber-700 dark:text-amber-400 mt-2 text-xs font-bold bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg">
                  <span>Pending Balance</span>
                  <span>₹{Math.max(0, grandTotal - paidAmount).toLocaleString()}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="w-full bg-primary hover:bg-primary-dark active:scale-98 text-white font-bold py-3.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md text-sm sm:text-base mt-2"
            >
              {submitting ? "Generating..." : "Generate Invoice"}
              <FileText size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProducts } from "@/app/actions/products";
import { createBill } from "@/app/actions/billing";
import { Plus, Trash2, CheckCircle2, FileText, ArrowLeft, IndianRupee } from "lucide-react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  sellingPrice: number;
  stock: number;
  unit: string;
};

type BillItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  total: number;
};

export default function NewBillPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ id: string } | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  
  const [items, setItems] = useState<BillItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "PARTIAL" | "PENDING">("PAID");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "BANK_TRANSFER" | "CARD">("CASH");
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data);
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

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), productId: "", quantity: 1, price: 0, total: 0 }]);
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
            updated.price = product.sellingPrice;
            updated.total = (updated.quantity || 0) * updated.price;
          }
        } else if (field === "quantity" || field === "price") {
          const qty = field === "quantity" ? value : updated.quantity;
          const prc = field === "price" ? value : updated.price;
          updated.total = (qty || 0) * (prc || 0);
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

    setSubmitting(true);
    const result = await createBill({
      customerName,
      customerMobile,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
        total: i.total
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
        <p className="text-sm font-medium">Loading products...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto my-6 sm:my-12 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Bill Created Successfully</h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">The invoice is generated and stock has been updated.</p>
        
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
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-700 px-5 py-3 rounded-lg font-semibold text-sm transition-all"
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
        <Link href="/billing" className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Bill</h1>
          <p className="text-xs sm:text-sm text-gray-500">Fast invoice generator</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Customer Info Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs">
          <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">
            Customer Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer full name"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
            <h2 className="text-sm sm:text-base font-bold text-gray-900">Products & Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="text-primary active:scale-95 font-semibold flex items-center gap-1 text-xs sm:text-sm bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-all"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 px-4 text-gray-500 bg-gray-50/70 rounded-xl border border-dashed border-gray-300">
              <p className="text-sm font-medium text-gray-700">No items added yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-3">Tap 'Add Item' to select products from your inventory.</p>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                <Plus size={15} /> Add Item
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Desktop Header */}
              <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-semibold text-gray-500 px-3">
                <div className="col-span-5">Product</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Price (₹)</div>
                <div className="col-span-2 text-right">Total (₹)</div>
                <div className="col-span-1"></div>
              </div>
              
              {items.map((item) => {
                const selectedProd = products.find(p => p.id === item.productId);
                return (
                  <div 
                    key={item.id} 
                    className="p-3 sm:p-2.5 rounded-xl bg-gray-50/80 border border-gray-200/70 flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-3 sm:items-center"
                  >
                    {/* Product Selection */}
                    <div className="sm:col-span-5">
                      <label className="block sm:hidden text-[11px] font-semibold text-gray-500 mb-1">Product</label>
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => updateItem(item.id, "productId", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary outline-none"
                      >
                        <option value="">Select product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock} {p.unit})</option>
                        ))}
                      </select>
                    </div>

                    {/* Mobile Row: Qty & Price & Total & Delete */}
                    <div className="grid grid-cols-3 sm:contents gap-2 items-center pt-1 sm:pt-0">
                      <div className="sm:col-span-2">
                        <label className="block sm:hidden text-[11px] font-semibold text-gray-500 mb-1">Qty</label>
                        <input
                          type="number"
                          required
                          min="0.1"
                          step="any"
                          value={item.quantity || ""}
                          onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                          placeholder="1"
                          className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block sm:hidden text-[11px] font-semibold text-gray-500 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="any"
                          value={item.price || ""}
                          onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full px-2.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2 sm:text-right flex flex-col justify-end">
                        <span className="block sm:hidden text-[11px] font-semibold text-gray-500 mb-1">Total</span>
                        <p className="font-extrabold text-gray-900 text-sm py-2 sm:py-0">₹{item.total.toLocaleString()}</p>
                      </div>

                      <div className="col-span-3 sm:col-span-1 text-right pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="w-full sm:w-auto text-red-500 hover:text-red-700 active:bg-red-100 p-1.5 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                          <span className="inline sm:hidden">Remove</span>
                        </button>
                      </div>
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
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs space-y-3.5">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Payment Mode & Status
            </h2>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Payment Status</label>
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
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                <option value="CARD">Debit / Credit Card</option>
              </select>
            </div>

            {paymentStatus === "PARTIAL" && (
              <div className="pt-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Paid Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={paidAmount || ""}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Amount received"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Bill Notes / Remarks (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 5-year warranty included, delivery within 7 days, special custom finish..."
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none resize-none"
              />
            </div>
          </div>

          {/* Bill Summary Card */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-3 border-b border-gray-200/80 pb-2">
                Bill Summary
              </h2>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Discount (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={discount || ""}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-28 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg text-right bg-white outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span>Tax / GST (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={tax || ""}
                    onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-28 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg text-right bg-white outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3">
                <span className="text-base sm:text-lg font-bold text-gray-900">Grand Total</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-primary">₹{grandTotal.toLocaleString()}</span>
              </div>
              
              {paymentStatus === "PARTIAL" && (
                <div className="flex justify-between items-center text-amber-700 mt-2 text-xs font-bold bg-amber-50 p-2 rounded-lg">
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

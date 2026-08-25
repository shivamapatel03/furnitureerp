import { getBillById } from "@/app/actions/billing";
import { getSettings } from "@/app/actions/settings";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import logoImg from "@/logo/logo.png";
import SuccessModal from "@/app/(dashboard)/billing/[id]/print/SuccessModal";
import ActionButtons from "@/app/(dashboard)/billing/[id]/print/ActionButtons";

export default async function StandalonePrintPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [bill, settings] = await Promise.all([getBillById(id), getSettings()]);

  if (!bill) {
    notFound();
  }

  const paidAmount = bill.payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 pb-28 sm:pb-8 flex flex-col items-center relative">
      <SuccessModal billNumber={bill.billNumber} />
      
      <div className="mb-6 w-full max-w-3xl flex justify-center sm:justify-end no-print">
        <ActionButtons billNumber={bill.billNumber} />
      </div>

      <div id="print-area" className="w-full max-w-3xl bg-white shadow-xl overflow-hidden relative print:shadow-none print:w-full">
        {/* Dark Header with slight curve */}
        <div className="bg-[#2D2D2D] text-white px-8 sm:px-12 py-10 rounded-br-[60px] flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-xl inline-block">
              <Image 
                src={logoImg} 
                alt="Furniture ERP Logo" 
                width={140} 
                height={50} 
                className="object-contain h-10 w-auto"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black tracking-widest uppercase text-white leading-none mb-1">Bhurjala</h1>
              <p className="text-sm font-medium tracking-[0.3em] text-red-500 uppercase leading-none">Furniture</p>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs text-gray-300 space-y-1.5">
            <p><span className="text-red-500 font-bold inline-block w-16 sm:w-auto">Phone:</span> {settings.phone}</p>
            <p><span className="text-red-500 font-bold inline-block w-16 sm:w-auto">Address:</span> {settings.address}</p>
          </div>
        </div>

        <div className="px-8 sm:px-12 py-10">
          {/* Info Row */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-start mb-12 gap-8 sm:gap-0">
            <div className="w-full sm:w-1/2">
              <p className="text-xs font-bold text-gray-500 mb-2">TO:</p>
              <p className="text-lg font-bold text-gray-900 uppercase">{bill.customer.name}</p>
              <p className="text-sm text-gray-600 mt-1">Mobile: {bill.customer.mobile}</p>
            </div>
            <div className="w-full sm:w-1/2 sm:text-right">
              <h2 className="text-4xl sm:text-5xl font-light tracking-widest text-gray-800 mb-6 sm:mb-4 uppercase">Invoice</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 sm:ml-auto w-fit text-left">
                <span className="font-bold text-gray-800">Invoice No</span> <span>: {bill.billNumber}</span>
                <span className="font-bold text-gray-800">Date</span> <span>: {format(new Date(bill.date), 'dd/MMM/yyyy')}</span>
                <span className="font-bold text-gray-800">Status</span> <span className="font-medium text-gray-900">: {bill.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mb-10 overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="bg-red-600 text-white font-bold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 text-left">Item Description</th>
                  <th className="py-3 px-4 text-center">Price</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="py-4 px-4 text-gray-900 font-medium border-b border-gray-100">{item.product.name}</td>
                    <td className="py-4 px-4 text-center text-gray-600 border-b border-gray-100">₹{item.price.toLocaleString()}</td>
                    <td className="py-4 px-4 text-center text-gray-600 border-b border-gray-100">{item.quantity} {item.product.unit}</td>
                    <td className="py-4 px-4 text-right text-gray-900 font-bold border-b border-gray-100">₹{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-16 gap-8 sm:gap-0">
            <div className="w-full sm:w-1/2 sm:pr-8 text-sm text-gray-600">
              <h4 className="font-bold text-gray-900 mb-3 uppercase text-xs tracking-wider">Payment Info</h4>
              <p className="mb-1">Amount Paid: <span className="font-medium text-gray-900">₹{paidAmount.toLocaleString()}</span></p>
              {bill.grandTotal - paidAmount > 0 && (
                <p className="text-red-600 font-bold">Balance Due: ₹{(bill.grandTotal - paidAmount).toLocaleString()}</p>
              )}
            </div>
            
            <div className="w-full sm:w-1/2">
              <div className="flex justify-between text-sm text-gray-600 px-4 mb-2">
                <span>Sub Total</span>
                <span>₹{bill.subtotal.toLocaleString()}</span>
              </div>
              {bill.discount > 0 && (
                <div className="flex justify-between text-sm text-gray-600 px-4 mb-2">
                  <span>Discount</span>
                  <span>-₹{bill.discount.toLocaleString()}</span>
                </div>
              )}
              {bill.tax > 0 && (
                <div className="flex justify-between text-sm text-gray-600 px-4 mb-2">
                  <span>Tax</span>
                  <span>₹{bill.tax.toLocaleString()}</span>
                </div>
              )}
              <div className="bg-red-600 flex justify-between items-center py-3 px-4 mt-4 font-bold text-white text-base">
                <span>GRAND TOTAL</span>
                <span>₹{bill.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer & Stamp */}
          <div className="flex justify-between items-end">
            <div className="w-2/3">
              <h4 className="font-bold text-gray-900 text-lg mb-2">Thank you for your business!</h4>
              <p className="text-[10px] text-gray-400 leading-tight uppercase">
                Terms: Goods once sold will not be taken back. Subject to local jurisdiction.
              </p>
            </div>

            {/* Circular Verified Stamp */}
            <div className="relative w-28 h-28 flex flex-col items-center justify-center -rotate-12 opacity-80 border-[3px] border-red-600 rounded-full shrink-0 select-none">
              <div className="absolute inset-1 border border-red-600 rounded-full pointer-events-none" />
              <div className="text-center text-red-600 px-2 mt-1">
                <p className="text-[8px] font-bold uppercase tracking-widest text-center leading-tight mb-1">Bhurjala<br/>Furniture</p>
                <div className="w-16 h-px bg-red-600 mx-auto my-1" />
                <p className="font-black text-sm tracking-widest">VERIFIED</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

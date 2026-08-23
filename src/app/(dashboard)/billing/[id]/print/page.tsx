import { getBillById } from "@/app/actions/billing";
import { getSettings } from "@/app/actions/settings";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import ActionButtons from "./ActionButtons";
import Image from "next/image";
import logoImg from "@/logo/logo.png";
import SuccessModal from "./SuccessModal";

export default async function PrintBillPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [bill, settings] = await Promise.all([getBillById(params.id), getSettings()]);

  if (!bill) {
    notFound();
  }

  const paidAmount = bill.payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-8 pb-28 sm:pb-8 flex flex-col items-center relative">
      <SuccessModal billNumber={bill.billNumber} />
      <div className="mb-6 w-full max-w-3xl flex justify-center sm:justify-end no-print">
        <ActionButtons billNumber={bill.billNumber} />
      </div>

      <div id="print-area" className="w-full max-w-3xl bg-white p-12 shadow-sm border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <div className="mb-4">
              <Image 
                src={logoImg} 
                alt="Furniture ERP Logo" 
                width={150} 
                height={50} 
                className="object-contain"
              />
            </div>
            <p className="text-gray-500 text-sm">{settings.address}</p>
            <p className="text-gray-500 text-sm">Phone: {settings.phone}</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-primary mb-2">INVOICE</h2>
            <p className="text-gray-900 font-medium">Bill No: {bill.billNumber}</p>
            <p className="text-gray-500">Date: {format(new Date(bill.date), 'dd MMM yyyy')}</p>
            <p className="text-gray-500">Status: <span className="font-medium text-gray-900">{bill.paymentStatus}</span></p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To:</h3>
          <p className="text-lg font-medium text-gray-900">{bill.customer.name}</p>
          <p className="text-gray-600">Mobile: {bill.customer.mobile}</p>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-900 text-left">
              <th className="py-3 text-gray-900 font-bold w-1/2">Product</th>
              <th className="py-3 text-gray-900 font-bold text-center">Qty</th>
              <th className="py-3 text-gray-900 font-bold text-right">Price</th>
              <th className="py-3 text-gray-900 font-bold text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bill.items.map((item, index) => (
              <tr key={item.id}>
                <td className="py-4 text-gray-900">{item.product.name}</td>
                <td className="py-4 text-gray-900 text-center">{item.quantity} {item.product.unit}</td>
                <td className="py-4 text-gray-900 text-right">₹{item.price.toLocaleString()}</td>
                <td className="py-4 text-gray-900 text-right font-medium">₹{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-1/2 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₹{bill.subtotal.toLocaleString()}</span>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discount:</span>
                <span>-₹{bill.discount.toLocaleString()}</span>
              </div>
            )}
            {bill.tax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>₹{bill.tax.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-900 pt-2 mt-2">
              <span>Grand Total:</span>
              <span>₹{bill.grandTotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-gray-600 pt-2">
              <span>Amount Paid:</span>
              <span>₹{paidAmount.toLocaleString()}</span>
            </div>
            
            {bill.grandTotal - paidAmount > 0 && (
              <div className="flex justify-between text-orange-600 font-medium">
                <span>Balance Due:</span>
                <span>₹{(bill.grandTotal - paidAmount).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
          <p className="mt-1">For any queries regarding this invoice, please contact us.</p>
        </div>
      </div>
    </div>
  );
}

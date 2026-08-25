import { getEstimateById } from "@/app/actions/estimator";
import { getSettings } from "@/app/actions/settings";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Image from "next/image";
import logoImg from "@/logo/logo.png";
import ActionButtons from "@/app/(dashboard)/billing/[id]/print/ActionButtons";
import { RoomEstimate, BillOfMaterials } from "@/lib/estimator/types";

export default async function EstimatePrintPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [estimate, settings] = await Promise.all([getEstimateById(id), getSettings()]);

  if (!estimate) {
    notFound();
  }

  let rooms: RoomEstimate[] = [];
  let bom: BillOfMaterials | null = null;

  try {
    rooms = JSON.parse(estimate.roomsData);
  } catch (e) {
    rooms = [];
  }

  try {
    if (estimate.bomData) {
      bom = JSON.parse(estimate.bomData);
    }
  } catch (e) {
    bom = null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 pb-28 sm:pb-8 flex flex-col items-center">
      <div className="mb-6 w-full max-w-4xl flex justify-center sm:justify-end no-print">
        <ActionButtons billNumber={estimate.estimateNumber} customerName={estimate.clientName} />
      </div>

      <div id="print-area" className="w-full max-w-4xl bg-white p-8 sm:p-12 shadow-sm border border-gray-200">
        {/* Company Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-6">
          <div>
            <div className="mb-3">
              <Image
                src={logoImg}
                alt="Bhurjala Furniture"
                width={160}
                height={55}
                className="object-contain"
              />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm font-medium">{settings.companyName || "Bhurjala Furniture"}</p>
            <p className="text-gray-500 text-xs">{settings.address}</p>
            <p className="text-gray-500 text-xs">Phone: {settings.phone}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl sm:text-3xl font-black text-primary tracking-tight mb-1">
              FURNITURE ESTIMATE
            </h2>
            <p className="text-gray-900 font-bold text-sm">Estimate No: {estimate.estimateNumber}</p>
            <p className="text-gray-500 text-xs">Date: {format(new Date(estimate.createdAt), "dd MMM yyyy")}</p>
            <div className="mt-2 inline-block px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-bold rounded">
              Tier: {estimate.qualityTier}
            </div>
          </div>
        </div>

        {/* Client & Project Overview */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl mb-6 text-xs sm:text-sm">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Client Details:</h3>
            <p className="font-bold text-gray-900 text-sm sm:text-base">
              {estimate.clientName || "Walk-in Valued Client"}
            </p>
            <p className="text-gray-600">Mobile: {estimate.clientMobile || "N/A"}</p>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Space Specification:</h3>
            <p className="font-bold text-gray-900">
              {estimate.propertyType} • {estimate.totalSqft} Sq.Ft.
            </p>
            <p className="text-gray-600">Theme: {estimate.style || "Modern Contemporary"}</p>
          </div>
        </div>

        {/* Room by Room Itemized Tables */}
        <div className="space-y-6 mb-8">
          {rooms
            .filter((r) => r.isSelected)
            .map((room) => (
              <div key={room.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100/80 px-4 py-2 flex justify-between items-center border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{room.name}</span>
                    <span className="text-xs text-gray-500">({room.approxSqft} sqft)</span>
                  </div>
                  <span className="font-bold text-gray-900 text-xs sm:text-sm">
                    Subtotal: ₹{room.subtotal.toLocaleString()}
                  </span>
                </div>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                      <th className="py-2 px-3 w-5/12">Item & Material Specs</th>
                      <th className="py-2 px-3 text-center">Dimensions</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Rate</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {room.furnitureItems
                      .filter((i) => i.isSelected)
                      .map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-gray-900">{item.name}</p>
                            <p className="text-[11px] text-gray-500">{item.recommendedMaterial}</p>
                          </td>
                          <td className="py-2.5 px-3 text-center text-gray-600">{item.dimensions}</td>
                          <td className="py-2.5 px-3 text-center font-medium text-gray-900">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-gray-700">₹{item.selectedPrice.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                            ₹{item.totalPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>

        {/* BOM / Material Estimate Summary */}
        {bom && (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Estimated Raw Material & Hardware Requirement
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
              <p>
                <strong>18mm Marine Ply:</strong> {bom.plywood18mmSheets} Sheets
              </p>
              <p>
                <strong>12mm/6mm Ply:</strong> {bom.plywood12mmSheets + bom.plywood6mmSheets} Sheets
              </p>
              <p>
                <strong>Laminates (8x4):</strong> {bom.laminateSheets} Sheets
              </p>
              <p>
                <strong>Soft-Close Hinges:</strong> {bom.softCloseHingesPairs} Pairs
              </p>
              <p>
                <strong>Telescopic Slides:</strong> {bom.telescopicSlidesSets} Sets
              </p>
              <p>
                <strong>Carpentry Labor:</strong> ~{bom.laborCarpenterDays} Days
              </p>
            </div>
          </div>
        )}

        {/* Totals & Notes */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t-2 border-gray-900 pt-4">
          <div className="max-w-md text-xs text-gray-500 space-y-1">
            <p className="font-bold text-gray-700 uppercase tracking-wider">Terms & Notes:</p>
            <p>1. This estimate is valid for 30 days from generation date.</p>
            <p>2. Hardware specifications use branded soft-close fittings with manufacturer warranty.</p>
            <p>3. 50% advance upon confirmation, 40% on material delivery, 10% on completion.</p>
            {estimate.notes && <p className="text-gray-900 font-semibold mt-2">Special Note: {estimate.notes}</p>}
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between font-extrabold text-base sm:text-lg text-gray-900 border-b border-gray-200 pb-2">
              <span>Total Estimated Cost:</span>
              <span className="text-primary">₹{estimate.totalCost.toLocaleString()}</span>
            </div>
            <p className="text-right text-gray-400 text-[11px]">
              Avg rate: ₹{Math.round(estimate.totalCost / Math.max(1, estimate.totalSqft))}/sqft
            </p>
          </div>
        </div>

        {/* Signature Box */}
        <div className="mt-16 pt-6 border-t border-gray-200 flex justify-between items-end text-xs text-gray-500">
          <div>
            <p>Client Signature</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900">For Bhurjala Furniture</p>
            <p className="mt-8">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSettings } from "@/app/actions/settings";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const billId = params.id;

    if (!billId) {
      return new NextResponse("Bill ID is required", { status: 400 });
    }

    const [bill, settings] = await Promise.all([
      prisma.bill.findUnique({
        where: { id: billId },
        include: {
          customer: true,
          items: { include: { product: true } },
          payments: true,
        },
      }),
      getSettings(),
    ]);

    if (!bill) {
      return new NextResponse("Bill not found", { status: 404 });
    }

    // Generate Vector PDF
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // 1. Dark Top Header Bar
    doc.setFillColor(45, 45, 45);
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("BHURJALA", 14, 13);

    doc.setTextColor(239, 68, 68);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("FURNITURE", 14, 21);

    doc.setTextColor(220, 220, 220);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    const phone = settings?.phone || "Contact via App";
    const address = settings?.address || "Main Showroom & Workshop";
    doc.text(`Phone: ${phone}`, 196, 13, { align: "right" });
    doc.text(`Address: ${address}`, 196, 20, { align: "right" });

    // 2. Customer Info & Invoice Meta
    const startY = 38;

    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("BILLED TO:", 14, startY);

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(bill.customer?.name?.toUpperCase() || "CUSTOMER", 14, startY + 6);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Mobile: ${bill.customer?.mobile || "—"}`, 14, startY + 11);

    const metaX = 135;
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE DETAILS:", metaX, startY);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(8.5);
    doc.text(`Invoice No:`, metaX, startY + 6);
    doc.setFont("helvetica", "bold");
    doc.text(bill.billNumber, 196, startY + 6, { align: "right" });

    doc.setFont("helvetica", "normal");
    const billDate = bill.date || bill.createdAt;
    const formattedDate = billDate
      ? new Date(billDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";
    doc.text(`Date:`, metaX, startY + 11);
    doc.text(formattedDate, 196, startY + 11, { align: "right" });

    if (bill.category) {
      doc.text(`Category:`, metaX, startY + 16);
      doc.text(bill.category, 196, startY + 16, { align: "right" });
    }

    const paidAmount = (bill.payments || []).reduce(
      (acc: number, p: any) => acc + (p.amount || 0),
      0
    );
    const balanceDue = Math.max(0, bill.grandTotal - paidAmount);

    const statusY = startY + (bill.category ? 21 : 16);
    doc.text(`Payment Status:`, metaX, statusY);
    if (bill.paymentStatus === "PAID" || balanceDue === 0) {
      doc.setTextColor(22, 101, 52);
      doc.setFont("helvetica", "bold");
      doc.text("PAID", 196, statusY, { align: "right" });
    } else if (bill.paymentStatus === "PARTIAL" || (paidAmount > 0 && balanceDue > 0)) {
      doc.setTextColor(180, 83, 9);
      doc.setFont("helvetica", "bold");
      doc.text("PARTIAL", 196, statusY, { align: "right" });
    } else {
      doc.setTextColor(185, 28, 28);
      doc.setFont("helvetica", "bold");
      doc.text("PENDING", 196, statusY, { align: "right" });
    }

    // 3. Line Items Table
    const tableStartY = statusY + 8;
    const tableData = (bill.items || []).map((item: any, index: number) => {
      const isSqft = item.calculationType === "SQFT" || item.sqft;
      const rateText = isSqft ? `₹${item.ratePerSqft || item.price}/sqft` : `₹${item.price}/unit`;
      const qtyText = isSqft ? `${item.sqft || item.quantity} sqft` : `${item.quantity} units`;
      const categoryText = isSqft ? `Sqft (${bill.category || "Custom"})` : "Unit Item";

      return [
        String(index + 1),
        item.product?.name || "Custom Item",
        categoryText,
        rateText,
        qtyText,
        `₹${Number(item.total).toLocaleString()}`,
      ];
    });

    autoTable(doc, {
      startY: tableStartY,
      head: [["#", "Item Description", "Type", "Rate", "Quantity / Sqft", "Amount"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [45, 45, 45],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 30, 30],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 62, fontStyle: "bold" },
        2: { cellWidth: 35 },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 25, halign: "center" },
        5: { cellWidth: 28, halign: "right", fontStyle: "bold" },
      },
    });

    // 4. Totals & Payment Summary Box
    // @ts-ignore
    const finalY = (doc as any).lastAutoTable.finalY + 6;
    const summaryBoxX = 120;
    const summaryWidth = 76;

    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(225, 225, 225);
    doc.roundedRect(summaryBoxX, finalY, summaryWidth, 40, 2, 2, "FD");

    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);

    doc.text("Subtotal:", summaryBoxX + 4, finalY + 6);
    doc.text(`₹${Number(bill.subtotal).toLocaleString()}`, 192, finalY + 6, { align: "right" });

    if (bill.discount > 0) {
      doc.text("Discount:", summaryBoxX + 4, finalY + 12);
      doc.setTextColor(220, 38, 38);
      doc.text(`-₹${Number(bill.discount).toLocaleString()}`, 192, finalY + 12, { align: "right" });
      doc.setTextColor(80, 80, 80);
    }

    doc.setDrawColor(220, 220, 220);
    doc.line(summaryBoxX + 4, finalY + 16, summaryBoxX + summaryWidth - 4, finalY + 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text("Grand Total:", summaryBoxX + 4, finalY + 23);
    doc.text(`₹${Number(bill.grandTotal).toLocaleString()}`, 192, finalY + 23, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(22, 101, 52);
    doc.text("Amount Paid:", summaryBoxX + 4, finalY + 29);
    doc.text(`₹${Number(paidAmount).toLocaleString()}`, 192, finalY + 29, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(balanceDue > 0 ? 185 : 22, balanceDue > 0 ? 28 : 101, balanceDue > 0 ? 28 : 52);
    doc.text("Balance Due:", summaryBoxX + 4, finalY + 36);
    doc.text(`₹${Number(balanceDue).toLocaleString()}`, 192, finalY + 36, { align: "right" });

    if (bill.notes) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("Notes / Remarks:", 14, finalY + 6);
      doc.text(bill.notes, 14, finalY + 12, { maxWidth: 95 });
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text("Thank you for your business! | Bhurjala Furniture", 105, 285, { align: "center" });

    const safeCustomer = bill.customer?.name?.replace(/[^a-zA-Z0-9]/g, "_") || "Customer";
    const filename = `${safeCustomer}_${bill.billNumber}.pdf`;

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error generating bill PDF API:", error);
    return new NextResponse(`Failed to generate PDF: ${error.message}`, { status: 500 });
  }
}

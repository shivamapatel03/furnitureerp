import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Capacitor } from "@capacitor/core";

/**
 * Universal safe PDF saver.
 * Handles mobile Android/iOS native apps, mobile browsers, and desktop browsers.
 */
export async function savePdfDoc(pdf: jsPDF, filename: string): Promise<boolean> {
  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

  // 1. Native Capacitor Mobile App Handling
  if (Capacitor.isNativePlatform()) {
    try {
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      const { Share } = await import("@capacitor/share");

      const base64Data = pdf.output("datauristring").split(",")[1];
      const savedFile = await Filesystem.writeFile({
        path: cleanFilename,
        data: base64Data,
        directory: Directory.Cache,
      });

      await Share.share({
        title: cleanFilename,
        text: cleanFilename,
        url: savedFile.uri,
        dialogTitle: "Save or Share PDF",
      });

      return true;
    } catch (nativeErr) {
      console.warn("Native capacitor save failed, trying web fallback:", nativeErr);
    }
  }

  // 2. Mobile Browser (Web Share API for Chrome/Safari)
  const pdfBlob = pdf.output("blob");
  const pdfFile = new File([pdfBlob], cleanFilename, { type: "application/pdf" });
  if (
    typeof navigator !== "undefined" &&
    navigator.canShare &&
    navigator.canShare({ files: [pdfFile] })
  ) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: cleanFilename,
      });
      return true;
    } catch (shareErr: any) {
      if (shareErr.name === "AbortError") {
        return true;
      }
    }
  }

  // 3. Direct Anchor download with Blob URL (Universal standard)
  try {
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = cleanFilename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 4000);
    return true;
  } catch (blobErr) {
    console.warn("Anchor blob download failed, calling pdf.save:", blobErr);
  }

  // 4. Default jsPDF save method
  try {
    pdf.save(cleanFilename);
    return true;
  } catch (saveErr) {
    console.error("All file saving methods failed:", saveErr);
    if (typeof window !== "undefined") {
      window.print();
      return true;
    }
    return false;
  }
}

/**
 * Generates and downloads a crystal-clear vector PDF for Invoices.
 * Direct 1-click download on Desktop and Mobile without opening new tabs.
 */
export async function downloadBillPdf(bill: any, settings?: any): Promise<boolean> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

  // 1. Dark Top Header Bar
  doc.setFillColor(45, 45, 45);
  doc.rect(0, 0, 210, 30, "F");

  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("BHURJALA", 14, 13);

  doc.setTextColor(239, 68, 68); // Red-500
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("FURNITURE", 14, 21);

  // Company Details (Right side)
  doc.setTextColor(220, 220, 220);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  const phone = settings?.phone || "Contact via App";
  const address = settings?.address || "Main Showroom & Workshop";
  doc.text(`Phone: ${phone}`, 196, 13, { align: "right" });
  doc.text(`Address: ${address}`, 196, 20, { align: "right" });

  // 2. Customer Info & Invoice Meta
  const startY = 38;
  
  // Left: Billed To
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
  if (bill.customer?.address) {
    doc.text(`Address: ${bill.customer.address}`, 14, startY + 16);
  }

  // Right: Invoice Details Box
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
    ? new Date(billDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  doc.text(`Date:`, metaX, startY + 11);
  doc.text(formattedDate, 196, startY + 11, { align: "right" });

  if (bill.category) {
    doc.text(`Category:`, metaX, startY + 16);
    doc.text(bill.category, 196, startY + 16, { align: "right" });
  }

  const paidAmount = (bill.payments || []).reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
  const balanceDue = Math.max(0, bill.grandTotal - paidAmount);

  // Status Badge
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
  const itemsList = bill.items && bill.items.length > 0 ? bill.items : [];

  const tableData = itemsList.map((item: any, index: number) => {
    const isSqft = item.calculationType === "SQFT" || item.sqft;
    const rateText = isSqft
      ? `Rs. ${(item.ratePerSqft || item.price).toLocaleString()}/sqft`
      : `Rs. ${item.price.toLocaleString()}/unit`;
    const qtyText = isSqft
      ? `${item.sqft || item.quantity} sqft`
      : `${item.quantity} units`;
    const categoryText = isSqft
      ? `Sqft (${bill.category || "Custom"})`
      : "Unit Item";

    return [
      String(index + 1),
      item.product?.name || "Custom Furniture Item",
      categoryText,
      rateText,
      qtyText,
      `Rs. ${Number(item.total).toLocaleString()}`,
    ];
  });

  if (tableData.length === 0) {
    tableData.push([
      "1",
      "Furniture Works / Order",
      bill.category || "Standard",
      `Rs. ${Number(bill.grandTotal).toLocaleString()}`,
      "1 Job",
      `Rs. ${Number(bill.grandTotal).toLocaleString()}`,
    ]);
  }

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
      fontSize: 8.5,
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

  // 4. Totals & Payment Summary Box (Under table)
  const hasDiscount = (bill.discount || 0) > 0;
  const hasTax = (bill.tax || 0) > 0;
  let extraLines = 0;
  if (hasDiscount) extraLines++;
  if (hasTax) extraLines++;

  const boxHeight = 36 + extraLines * 6;
  // @ts-ignore
  const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 6 : tableStartY + 40;
  const summaryBoxX = 120;
  const summaryWidth = 76;

  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(225, 225, 225);
  doc.roundedRect(summaryBoxX, finalY, summaryWidth, boxHeight, 2, 2, "FD");

  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);

  let currentLineY = finalY + 6;

  // Subtotal
  doc.text("Subtotal:", summaryBoxX + 4, currentLineY);
  doc.text(`Rs. ${Number(bill.subtotal).toLocaleString()}`, 192, currentLineY, { align: "right" });

  // Discount
  if (hasDiscount) {
    currentLineY += 6;
    doc.text("Discount:", summaryBoxX + 4, currentLineY);
    doc.setTextColor(220, 38, 38);
    doc.text(`-Rs. ${Number(bill.discount).toLocaleString()}`, 192, currentLineY, { align: "right" });
    doc.setTextColor(80, 80, 80);
  }

  // GST / Tax
  if (hasTax) {
    currentLineY += 6;
    doc.text("GST / Tax:", summaryBoxX + 4, currentLineY);
    doc.setTextColor(30, 30, 30);
    doc.text(`+Rs. ${Number(bill.tax).toLocaleString()}`, 192, currentLineY, { align: "right" });
    doc.setTextColor(80, 80, 80);
  }

  // Divider
  currentLineY += 4;
  doc.setDrawColor(220, 220, 220);
  doc.line(summaryBoxX + 4, currentLineY, summaryBoxX + summaryWidth - 4, currentLineY);

  // Grand Total
  currentLineY += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  doc.text("Grand Total:", summaryBoxX + 4, currentLineY);
  doc.text(`Rs. ${Number(bill.grandTotal).toLocaleString()}`, 192, currentLineY, { align: "right" });

  // Paid Amount
  currentLineY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text("Amount Paid:", summaryBoxX + 4, currentLineY);
  doc.text(`Rs. ${Number(paidAmount).toLocaleString()}`, 192, currentLineY, { align: "right" });

  // Balance Due
  currentLineY += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(balanceDue > 0 ? 185 : 22, balanceDue > 0 ? 28 : 101, balanceDue > 0 ? 28 : 52);
  doc.text("Balance Due:", summaryBoxX + 4, currentLineY);
  doc.text(`Rs. ${Number(balanceDue).toLocaleString()}`, 192, currentLineY, { align: "right" });

  // Notes or Footer on bottom left
  if (bill.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Notes / Remarks:", 14, finalY + 6);
    doc.text(bill.notes, 14, finalY + 12, { maxWidth: 95 });
  }

  // 5. Signature Section (Owner / Authorized Signatory Only)
  const signatureY = Math.max(finalY + boxHeight + 8, 240);

  // Right: Owner / Authorized Signatory Box
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text("For, BHURJALA FURNITURE", 196, signatureY + 5, { align: "right" });

  doc.setDrawColor(160, 160, 160);
  doc.line(140, signatureY + 18, 196, signatureY + 18);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Authorized Signature", 196, signatureY + 23, { align: "right" });

  // 6. Bottom Terms & Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text("Terms: Goods once sold will not be taken back. Subject to local jurisdiction.", 105, 280, { align: "center" });
  doc.text("Thank you for your business! | Bhurjala Furniture", 105, 285, { align: "center" });

  const safeCustomer = bill.customer?.name?.replace(/[^a-zA-Z0-9]/g, "_") || "Customer";
  const filename = `${safeCustomer}_${bill.billNumber}.pdf`;

  return await savePdfDoc(doc, filename);
}

/**
 * Generates and downloads a crystal-clear vector PDF for Daily Attendance.
 */
export async function downloadAttendanceReportPdf(
  dateFormatted: string,
  employees: Array<{ id: string; name: string; position: string | null; dailySalary: number }>,
  attendance: Array<{ employeeId: string; status: string }>
): Promise<boolean> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

  // Company Header
  doc.setFillColor(45, 45, 45);
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("BHURJALA FURNITURE", 14, 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("DAILY STAFF ATTENDANCE REPORT", 14, 20);

  doc.setFontSize(10);
  doc.text(`Date: ${dateFormatted}`, 196, 16, { align: "right" });

  // Calculate Statistics
  let presentCount = 0;
  let halfDayCount = 0;
  let absentCount = 0;

  employees.forEach((emp) => {
    const status = attendance.find((a) => a.employeeId === emp.id)?.status;
    if (status === "PRESENT") presentCount++;
    else if (status === "HALF_DAY") halfDayCount++;
    else if (status === "ABSENT") absentCount++;
  });

  // Stats Summary Boxes
  const startY = 34;
  doc.setDrawColor(220, 220, 220);

  // Total Staff Box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, startY, 42, 14, 2, 2, "FD");
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text("TOTAL STAFF", 18, startY + 5);
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(String(employees.length), 18, startY + 11);

  // Present Box
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(60, startY, 42, 14, 2, 2, "FD");
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(8);
  doc.text("PRESENT", 64, startY + 5);
  doc.setFontSize(12);
  doc.text(String(presentCount), 64, startY + 11);

  // Half Day Box
  doc.setFillColor(254, 252, 232);
  doc.roundedRect(106, startY, 42, 14, 2, 2, "FD");
  doc.setTextColor(133, 77, 14);
  doc.setFontSize(8);
  doc.text("HALF DAY", 110, startY + 5);
  doc.setFontSize(12);
  doc.text(String(halfDayCount), 110, startY + 11);

  // Absent Box
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(152, startY, 44, 14, 2, 2, "FD");
  doc.setTextColor(153, 27, 27);
  doc.setFontSize(8);
  doc.text("ABSENT", 156, startY + 5);
  doc.setFontSize(12);
  doc.text(String(absentCount), 156, startY + 11);

  // Table Body
  const tableData = employees.map((emp, index) => {
    const statusRecord = attendance.find((a) => a.employeeId === emp.id);
    const status = statusRecord?.status || "NOT MARKED";
    const statusDisplay =
      status === "PRESENT"
        ? "Present"
        : status === "HALF_DAY"
        ? "Half Day"
        : status === "ABSENT"
        ? "Absent"
        : "Not Marked";

    return [
      String(index + 1),
      emp.name,
      emp.position || "General Staff",
      `Rs. ${emp.dailySalary.toLocaleString()}/day`,
      statusDisplay,
    ];
  });

  autoTable(doc, {
    startY: 54,
    head: [["#", "Staff Name", "Role / Position", "Daily Rate", "Attendance Status"]],
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
      1: { cellWidth: 60, fontStyle: "bold" },
      2: { cellWidth: 50 },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: 35, halign: "center", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const text = String(data.cell.raw);
        if (text === "Present") {
          data.cell.styles.textColor = [22, 101, 52];
        } else if (text === "Half Day") {
          data.cell.styles.textColor = [180, 83, 9];
        } else if (text === "Absent") {
          data.cell.styles.textColor = [185, 28, 28];
        }
      }
    },
  });

  const dateSlug = dateFormatted.replace(/[^a-zA-Z0-9]/g, "_");
  return await savePdfDoc(doc, `Attendance_${dateSlug}.pdf`);
}

/**
 * Generates and downloads a crystal-clear vector PDF for Monthly Salary Summary.
 */
export async function downloadSalaryReportPdf(
  monthFormatted: string,
  salaryRows: Array<{
    employee: { name: string; position: string | null; dailySalary: number };
    presentDays: number;
    halfDays: number;
    absentDays: number;
    earnedSalary: number;
    totalAdvances: number;
    netSalary: number;
  }>
): Promise<boolean> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

  // Company Header
  doc.setFillColor(45, 45, 45);
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("BHURJALA FURNITURE", 14, 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("MONTHLY STAFF SALARY SUMMARY", 14, 20);

  doc.setFontSize(10);
  doc.text(`Month: ${monthFormatted}`, 196, 16, { align: "right" });

  const totalEarned = salaryRows.reduce((acc, r) => acc + r.earnedSalary, 0);
  const totalAdvances = salaryRows.reduce((acc, r) => acc + r.totalAdvances, 0);
  const totalNet = salaryRows.reduce((acc, r) => acc + r.netSalary, 0);

  // Summary Cards
  const startY = 34;
  doc.setDrawColor(220, 220, 220);

  // Total Gross Earned
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, startY, 56, 14, 2, 2, "FD");
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text("TOTAL GROSS EARNED", 18, startY + 5);
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs. ${totalEarned.toLocaleString()}`, 18, startY + 11);

  // Total Advances
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(74, startY, 56, 14, 2, 2, "FD");
  doc.setTextColor(153, 27, 27);
  doc.setFontSize(8);
  doc.text("TOTAL ADVANCES DEDUCTED", 78, startY + 5);
  doc.setFontSize(11);
  doc.text(`Rs. ${totalAdvances.toLocaleString()}`, 78, startY + 11);

  // Total Net Payable
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(134, startY, 62, 14, 2, 2, "FD");
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(8);
  doc.text("TOTAL NET PAYABLE", 138, startY + 5);
  doc.setFontSize(12);
  doc.text(`Rs. ${totalNet.toLocaleString()}`, 138, startY + 11);

  // Table
  const tableData = salaryRows.map((row, index) => [
    String(index + 1),
    row.employee.name,
    row.employee.position || "Staff",
    `Rs. ${row.employee.dailySalary}`,
    String(row.presentDays),
    String(row.halfDays),
    String(row.absentDays),
    `Rs. ${row.earnedSalary.toLocaleString()}`,
    `Rs. ${row.totalAdvances.toLocaleString()}`,
    `Rs. ${row.netSalary.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: 54,
    head: [
      [
        "#",
        "Staff Name",
        "Role",
        "Daily",
        "P",
        "HD",
        "A",
        "Earned",
        "Advance",
        "Net Salary",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [45, 45, 45],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 30, 30],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 38, fontStyle: "bold" },
      2: { cellWidth: 26 },
      3: { cellWidth: 18, halign: "right" },
      4: { cellWidth: 10, halign: "center" },
      5: { cellWidth: 10, halign: "center" },
      6: { cellWidth: 10, halign: "center" },
      7: { cellWidth: 22, halign: "right" },
      8: { cellWidth: 20, halign: "right" },
      9: { cellWidth: 26, halign: "right", fontStyle: "bold", textColor: [22, 101, 52] },
    },
    foot: [
      [
        "",
        "TOTALS",
        "",
        "",
        "",
        "",
        "",
        `Rs. ${totalEarned.toLocaleString()}`,
        `Rs. ${totalAdvances.toLocaleString()}`,
        `Rs. ${totalNet.toLocaleString()}`,
      ],
    ],
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 9,
    },
  });

  const monthSlug = monthFormatted.replace(/[^a-zA-Z0-9]/g, "_");
  return await savePdfDoc(doc, `Salary_Summary_${monthSlug}.pdf`);
}

/**
 * Universal Invoice PDF Download using html2pdf + jsPDF savePdfDoc.
 */
export async function downloadInvoicePdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    if (typeof window !== "undefined") window.print();
    return false;
  }

  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

  // Temporarily suspend dark mode so captured PDF is pure light mode
  const root = document.documentElement;
  const wasDark = root.classList.contains("dark");

  try {
    if (wasDark) {
      root.classList.remove("dark");
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    // Try html2pdf.js
    // @ts-ignore
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default || html2pdfModule;

    const opt = {
      margin: 4,
      filename: cleanFilename,
      image: { type: "jpeg" as const, quality: 0.85 },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        logging: false,
      },
      jsPDF: { unit: "mm" as const, format: "a4", orientation: "portrait" as const, compressPDF: true },
    };

    const pdfBlob: Blob = await html2pdf().set(opt).from(element).outputPdf("blob");

    // Convert blob to jsPDF or save directly
    if (Capacitor.isNativePlatform()) {
      try {
        const { Filesystem, Directory } = await import("@capacitor/filesystem");
        const { Share } = await import("@capacitor/share");

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const res = reader.result as string;
            const base64 = res.includes(",") ? res.split(",")[1] : res;
            resolve(base64);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(pdfBlob);
        const base64Data = await base64Promise;

        const savedFile = await Filesystem.writeFile({
          path: cleanFilename,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: cleanFilename,
          text: cleanFilename,
          url: savedFile.uri,
          dialogTitle: "Save or Share PDF",
        });

        return true;
      } catch (nativeErr) {
        console.warn("Native capacitor download fallback:", nativeErr);
      }
    }

    // Mobile & Desktop Web Blob Anchor trigger
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = cleanFilename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 4000);

    return true;
  } catch (error: any) {
    console.error("PDF download failed, trying secondary fallback:", error);
    if (typeof window !== "undefined") {
      window.print();
      return true;
    }
    return false;
  } finally {
    if (wasDark) {
      root.classList.add("dark");
    }
  }
}

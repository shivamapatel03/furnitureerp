import { NextRequest, NextResponse } from "next/server";
import { getMonthlySalary } from "@/app/actions/attendance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import fs from "fs";
import path from "path";

function getLogoBase64(): string | null {
  try {
    const logoPath = path.join(process.cwd(), "src", "logo", "logo.png");
    if (fs.existsSync(logoPath)) {
      const buffer = fs.readFileSync(logoPath);
      return `data:image/png;base64,${buffer.toString("base64")}`;
    }
  } catch (e) {
    console.error("Could not load logo for Salary PDF:", e);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const monthParam = searchParams.get("month"); // e.g. "2026-08"

    let year = now.getFullYear();
    let month = now.getMonth(); // 0-indexed

    if (monthParam && monthParam.includes("-")) {
      const parts = monthParam.split("-");
      year = parseInt(parts[0], 10) || year;
      month = parseInt(parts[1], 10) - 1;
    }

    const salaryRows = await getMonthlySalary(year, month);
    const monthDate = new Date(year, month, 1);
    const formattedMonth = monthDate.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

    // Company Header Bar with Logo
    doc.setFillColor(45, 45, 45);
    doc.rect(0, 0, 210, 30, "F");

    const logoBase64 = getLogoBase64();
    let textStartX = 14;

    if (logoBase64) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(12, 4, 22, 22, 2, 2, "F");
      try {
        doc.addImage(logoBase64, "PNG", 13, 5, 20, 20);
        textStartX = 38;
      } catch (err) {
        console.error("Failed adding logo to Salary PDF:", err);
      }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("BHURJALA FURNITURE", textStartX, 13);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 220, 220);
    doc.text("MONTHLY STAFF SALARY SUMMARY", textStartX, 21);

    doc.setFontSize(9.5);
    doc.text(`Month: ${formattedMonth}`, 196, 17, { align: "right" });

    const totalEarned = salaryRows.reduce((acc, r) => acc + r.earnedSalary, 0);
    const totalAdvances = salaryRows.reduce((acc, r) => acc + r.totalAdvances, 0);
    const totalNet = salaryRows.reduce((acc, r) => acc + r.netSalary, 0);

    // Summary Cards
    const startY = 36;
    doc.setDrawColor(220, 220, 220);

    // Total Gross Earned
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, startY, 56, 15, 2, 2, "FD");
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("TOTAL GROSS EARNED", 18, startY + 5.5);
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Rs. ${totalEarned.toLocaleString()}`, 18, startY + 12);

    // Total Advances
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(74, startY, 56, 15, 2, 2, "FD");
    doc.setTextColor(153, 27, 27);
    doc.setFontSize(8);
    doc.text("TOTAL ADVANCES DEDUCTED", 78, startY + 5.5);
    doc.setFontSize(11);
    doc.text(`Rs. ${totalAdvances.toLocaleString()}`, 78, startY + 12);

    // Total Net Payable
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(134, startY, 62, 15, 2, 2, "FD");
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(8);
    doc.text("TOTAL NET PAYABLE", 138, startY + 5.5);
    doc.setFontSize(12);
    doc.text(`Rs. ${totalNet.toLocaleString()}`, 138, startY + 12);

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
      startY: 57,
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

    // @ts-ignore
    const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 12 : 220;
    const signatureY = Math.max(finalY, 245);

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

    const filename = `Salary_Summary_${year}_${month + 1}.pdf`;
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error generating salary PDF API:", error);
    return new NextResponse(`Failed to generate PDF: ${error.message}`, { status: 500 });
  }
}

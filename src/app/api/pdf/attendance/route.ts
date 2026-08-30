import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
    console.error("Could not load logo for Attendance PDF:", e);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateQuery = searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const targetDate = new Date(dateQuery + "T00:00:00.000Z");

    const [employees, attendance] = await Promise.all([
      prisma.employee.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
      }),
      prisma.attendance.findMany({
        where: { date: targetDate },
      }),
    ]);

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

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
        console.error("Failed adding logo to Attendance PDF:", err);
      }
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("BHURJALA FURNITURE", textStartX, 13);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 220, 220);
    doc.text("DAILY STAFF ATTENDANCE REPORT", textStartX, 21);

    const formattedDate = targetDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    doc.setFontSize(9.5);
    doc.text(`Date: ${formattedDate}`, 196, 17, { align: "right" });

    // Stats
    let presentCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;

    employees.forEach((emp) => {
      const status = attendance.find((a) => a.employeeId === emp.id)?.status;
      if (status === "PRESENT") presentCount++;
      else if (status === "HALF_DAY") halfDayCount++;
      else if (status === "ABSENT") absentCount++;
    });

    const startY = 36;
    doc.setDrawColor(220, 220, 220);

    // Total Staff
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, startY, 42, 14, 2, 2, "FD");
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("TOTAL STAFF", 18, startY + 5);
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(String(employees.length), 18, startY + 11);

    // Present
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(60, startY, 42, 14, 2, 2, "FD");
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(8);
    doc.text("PRESENT", 64, startY + 5);
    doc.setFontSize(12);
    doc.text(String(presentCount), 64, startY + 11);

    // Half Day
    doc.setFillColor(254, 252, 232);
    doc.roundedRect(106, startY, 42, 14, 2, 2, "FD");
    doc.setTextColor(133, 77, 14);
    doc.setFontSize(8);
    doc.text("HALF DAY", 110, startY + 5);
    doc.setFontSize(12);
    doc.text(String(halfDayCount), 110, startY + 11);

    // Absent
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(152, startY, 44, 14, 2, 2, "FD");
    doc.setTextColor(153, 27, 27);
    doc.setFontSize(8);
    doc.text("ABSENT", 156, startY + 5);
    doc.setFontSize(12);
    doc.text(String(absentCount), 156, startY + 11);

    // Table
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
      startY: 56,
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

    const filename = `Staff_Attendance_${dateQuery}.pdf`;
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error generating attendance PDF API:", error);
    return new NextResponse(`Failed to generate PDF: ${error.message}`, { status: 500 });
  }
}

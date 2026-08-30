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
 * Generates and downloads a crystal-clear vector PDF for Daily Attendance.
 * 100% immune to DOM canvas issues, dark mode bugs, or mobile CSS errors.
 */
export async function downloadAttendanceReportPdf(
  dateFormatted: string,
  employees: Array<{ id: string; name: string; position: string | null; dailySalary: number }>,
  attendance: Array<{ employeeId: string; status: string }>
): Promise<boolean> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

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
      `₹${emp.dailySalary.toLocaleString()}/day`,
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
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

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
  doc.text(`₹${totalEarned.toLocaleString()}`, 18, startY + 11);

  // Total Advances
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(74, startY, 56, 14, 2, 2, "FD");
  doc.setTextColor(153, 27, 27);
  doc.setFontSize(8);
  doc.text("TOTAL ADVANCES DEDUCTED", 78, startY + 5);
  doc.setFontSize(11);
  doc.text(`₹${totalAdvances.toLocaleString()}`, 78, startY + 11);

  // Total Net Payable
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(134, startY, 62, 14, 2, 2, "FD");
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(8);
  doc.text("TOTAL NET PAYABLE", 138, startY + 5);
  doc.setFontSize(12);
  doc.text(`₹${totalNet.toLocaleString()}`, 138, startY + 11);

  // Table
  const tableData = salaryRows.map((row, index) => [
    String(index + 1),
    row.employee.name,
    row.employee.position || "Staff",
    `₹${row.employee.dailySalary}`,
    String(row.presentDays),
    String(row.halfDays),
    String(row.absentDays),
    `₹${row.earnedSalary.toLocaleString()}`,
    `₹${row.totalAdvances.toLocaleString()}`,
    `₹${row.netSalary.toLocaleString()}`,
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
        `₹${totalEarned.toLocaleString()}`,
        `₹${totalAdvances.toLocaleString()}`,
        `₹${totalNet.toLocaleString()}`,
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
      margin: 5,
      filename: cleanFilename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        logging: false,
      },
      jsPDF: { unit: "mm" as const, format: "a4", orientation: "portrait" as const },
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

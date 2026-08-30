import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import { Capacitor } from "@capacitor/core";

/**
 * Universal High-reliability PDF download utility.
 * Supports:
 * 1. Native Android App (Capacitor Filesystem + Native Share Sheet to Save/WhatsApp/Drive)
 * 2. Mobile Browser (Web Share API)
 * 3. Desktop Browsers (jsPDF file save + download link)
 */
export async function downloadInvoicePdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    alert("Element not found for download.");
    return false;
  }

  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

  // Detect and temporarily suspend dark mode so the captured PDF is pure, crisp light mode
  const root = document.documentElement;
  const wasDark = root.classList.contains("dark");

  try {
    if (wasDark) {
      root.classList.remove("dark");
      // Allow browsers a tiny tick to recalculate styles
      await new Promise(resolve => setTimeout(resolve, 80));
    }

    // 1. Generate high-resolution JPEG from DOM without CORS font blocking
    const imgData = await toJpeg(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      cacheBust: true,
      filter: (node) => {
        // Exclude print-hidden action buttons from the rasterized image
        if (node instanceof HTMLElement && node.classList.contains("print:hidden")) {
          return false;
        }
        return true;
      }
    });

    // 2. Initialize jsPDF in portrait A4 (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297 mm
    const margin = 8; // 8 mm margin
    const maxWidth = pageWidth - margin * 2; // 194 mm
    const maxHeight = pageHeight - margin * 2; // 281 mm

    // Calculate aspect ratio
    const img = new Image();
    img.src = imgData;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const imgRatio = img.width / img.height;
    let renderWidth = maxWidth;
    let renderHeight = renderWidth / imgRatio;

    if (renderHeight > maxHeight) {
      renderHeight = maxHeight;
      renderWidth = renderHeight * imgRatio;
    }

    const xOffset = (pageWidth - renderWidth) / 2;
    const yOffset = margin;

    pdf.addImage(imgData, "JPEG", xOffset, yOffset, renderWidth, renderHeight);

    // 3. Check if running inside Native Mobile App (Capacitor Android / iOS)
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
        console.warn("Native Filesystem/Share failed, trying browser fallbacks:", nativeErr);
      }
    }

    // 4. Mobile Browser Web Share API (iOS Safari & Android Chrome)
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

    // 5. Desktop browser download via jsPDF save
    pdf.save(cleanFilename);

    return true;
  } catch (error: any) {
    console.error("PDF generation error, falling back to print dialog:", error);
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

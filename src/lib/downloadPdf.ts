import jsPDF from "jspdf";
import { Capacitor } from "@capacitor/core";

/**
 * Universal High-reliability PDF download utility.
 * Supports:
 * 1. Desktop & Mobile Web on Vercel (html2pdf with CORS & Taint tolerance + direct file download)
 * 2. Native Android App (Capacitor Filesystem + Native Share Sheet to Save/WhatsApp/Drive)
 * 3. Fallback to rasterization and native Print dialog
 */
export async function downloadInvoicePdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    if (typeof window !== "undefined") {
      window.print();
    }
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

    // Try html2pdf.js (handles CSS, tables, fonts, and A4 scaling automatically)
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

    // 1. Check if running inside Native Mobile App (Capacitor Android / iOS)
    if (Capacitor.isNativePlatform()) {
      try {
        const { Filesystem, Directory } = await import("@capacitor/filesystem");
        const { Share } = await import("@capacitor/share");

        const pdfBlob: Blob = await html2pdf().set(opt).from(element).outputPdf("blob");
        
        // Convert blob to base64 string
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
        console.warn("Native capacitor download failed, using standard download:", nativeErr);
      }
    }

    // 2. Direct browser save via html2pdf (Works on desktop & mobile Chrome, Safari, Edge, Firefox)
    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (error: any) {
    console.error("PDF download failed, attempting secondary download method:", error);
    try {
      const { toJpeg } = await import("html-to-image");
      const imgData = await toJpeg(element, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const img = new Image();
      img.src = imgData;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const imgRatio = img.width / img.height;
      let renderWidth = pageWidth - 10;
      let renderHeight = renderWidth / imgRatio;
      if (renderHeight > pageHeight - 10) {
        renderHeight = pageHeight - 10;
        renderWidth = renderHeight * imgRatio;
      }

      pdf.addImage(imgData, "JPEG", (pageWidth - renderWidth) / 2, 5, renderWidth, renderHeight);
      pdf.save(cleanFilename);
      return true;
    } catch (secErr) {
      console.error("All PDF methods failed, falling back to print dialog:", secErr);
      if (typeof window !== "undefined") {
        window.print();
        return true;
      }
      return false;
    }
  } finally {
    if (wasDark) {
      root.classList.add("dark");
    }
  }
}

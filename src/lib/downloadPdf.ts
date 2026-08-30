import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

/**
 * High-reliability PDF download utility.
 * Renders the invoice DOM into a high-res portrait A4 PDF and triggers direct download.
 */
export async function downloadInvoicePdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    alert("Invoice element not found on page.");
    return false;
  }

  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

  try {
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

    // 3. Primary download method via jsPDF save (works across Chrome, Edge, Safari, Firefox, Android)
    pdf.save(cleanFilename);

    return true;
  } catch (error: any) {
    console.error("PDF generation error, falling back to print dialog:", error);
    // Fallback to native print to PDF
    if (typeof window !== "undefined") {
      window.print();
      return true;
    }
    return false;
  }
}

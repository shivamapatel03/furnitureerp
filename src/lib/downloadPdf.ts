import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

/**
 * Modern, ultra-reliable PDF download utility.
 * Captures full-width desktop invoice at 2x retina resolution and scales
 * it to perfectly fill an A4 PDF page without narrow column distortion.
 */
export async function downloadInvoicePdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return false;
  }

  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

  try {
    // 1. Generate high-resolution JPEG from DOM using native browser rasterization
    const imgData = await toJpeg(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      cacheBust: true,
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

    // Calculate exact aspect ratio
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

    // 3. Create real binary PDF Blob
    const pdfBlob = pdf.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);

    // 4. Mobile file handling (iOS Safari / Android Chrome share sheet)
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
        URL.revokeObjectURL(blobUrl);
        return true;
      } catch (shareErr: any) {
        if (shareErr.name === "AbortError") {
          URL.revokeObjectURL(blobUrl);
          return true;
        }
      }
    }

    // 5. Direct Anchor download
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = cleanFilename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 4000);

    return true;
  } catch (error) {
    console.error("PDF generation error:", error);
    alert("Could not generate PDF. Please try again.");
    return false;
  }
}

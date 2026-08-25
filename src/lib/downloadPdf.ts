/**
 * Utility to safely generate and download a PDF from a DOM element on both mobile and desktop,
 * handling modern CSS color spaces (lab, oklch) and mobile viewport constraints.
 */
export async function downloadInvoicePdf(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return;
  }

  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

  // 1. Create a clean offscreen clone with fixed A4 dimensions (794px width)
  // This ensures mobile screens don't squish or crop the invoice
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.backgroundColor = "#ffffff";
  container.style.zIndex = "-9999";
  container.style.padding = "0";
  container.style.margin = "0";

  const cloned = element.cloneNode(true) as HTMLElement;
  cloned.style.width = "794px";
  cloned.style.maxWidth = "794px";
  cloned.style.boxShadow = "none";
  container.appendChild(cloned);
  document.body.appendChild(container);

  // 2. Normalize all modern CSS color formats (lab, oklch) to standard RGB/Hex
  // on every element BEFORE html2canvas reads them.
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const allElements = [cloned, ...Array.from(cloned.querySelectorAll<HTMLElement>("*"))];
      const colorProps = [
        "color",
        "backgroundColor",
        "borderColor",
        "borderTopColor",
        "borderBottomColor",
        "borderLeftColor",
        "borderRightColor",
        "outlineColor",
      ];

      allElements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        colorProps.forEach((prop) => {
          const val = (computed as any)[prop];
          if (
            val &&
            (val.includes("lab(") ||
              val.includes("oklch(") ||
              val.includes("oklab(") ||
              val.includes("color(") ||
              val.includes("color-mix("))
          ) {
            try {
              ctx.fillStyle = val;
              (el.style as any)[prop] = ctx.fillStyle;
            } catch {
              // fallback
            }
          }
        });
      });
    }
  } catch (err) {
    console.warn("Color normalization warning:", err);
  }

  try {
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default || html2pdfModule;

    const opt = {
      margin: 0.1,
      filename: cleanFilename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794,
        windowWidth: 794,
      },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    // @ts-expect-error - html2pdf loosely typed
    const pdfBlob: Blob = await html2pdf().set(opt).from(cloned).output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);

    // 3. Mobile handling: Try native file share if supported (iOS / Android), else trigger direct download
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
        return;
      } catch (shareError: any) {
        // If user cancelled share sheet, do nothing; otherwise fallback to anchor click
        if (shareError.name === "AbortError") {
          URL.revokeObjectURL(blobUrl);
          return;
        }
      }
    }

    // Direct Anchor download
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = cleanFilename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch (error) {
    console.warn("PDF download fallback to print:", error);
    window.print();
  } finally {
    // Clean up offscreen container
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

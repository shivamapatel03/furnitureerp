/**
 * High-reliability PDF download utility for Mobile and Desktop.
 * Inlines all computed styles and strips Tailwind v4 modern CSS rules
 * to completely eliminate html2canvas 'unsupported color function lab' crashes.
 */
export async function downloadInvoicePdf(elementId: string, filename: string): Promise<boolean> {
  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    console.error(`Element #${elementId} not found`);
    return false;
  }

  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

  // 1. Create an offscreen wrapper with fixed desktop A4 width (794px)
  const offscreenContainer = document.createElement("div");
  offscreenContainer.style.position = "fixed";
  offscreenContainer.style.left = "-9999px";
  offscreenContainer.style.top = "0";
  offscreenContainer.style.width = "794px";
  offscreenContainer.style.backgroundColor = "#ffffff";
  offscreenContainer.style.zIndex = "-99999";
  offscreenContainer.style.margin = "0";
  offscreenContainer.style.padding = "0";

  const clonedElement = sourceElement.cloneNode(true) as HTMLElement;
  clonedElement.style.width = "794px";
  clonedElement.style.maxWidth = "794px";
  clonedElement.style.boxShadow = "none";
  offscreenContainer.appendChild(clonedElement);
  document.body.appendChild(offscreenContainer);

  // 2. Inline all computed styles with normalized RGB/Hex colors
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const sourceNodes = [sourceElement, ...Array.from(sourceElement.querySelectorAll<HTMLElement>("*"))];
    const clonedNodes = [clonedElement, ...Array.from(clonedElement.querySelectorAll<HTMLElement>("*"))];

    for (let i = 0; i < sourceNodes.length && i < clonedNodes.length; i++) {
      const src = sourceNodes[i];
      const dst = clonedNodes[i];
      const computed = window.getComputedStyle(src);

      for (let j = 0; j < computed.length; j++) {
        const prop = computed[j];
        let val = computed.getPropertyValue(prop);

        // Sanitize modern CSS color spaces (oklch, lab, color-mix) to standard RGB/Hex
        if (
          val &&
          (val.includes("lab(") ||
            val.includes("oklch(") ||
            val.includes("oklab(") ||
            val.includes("color(") ||
            val.includes("color-mix("))
        ) {
          if (ctx) {
            try {
              ctx.fillStyle = val;
              val = ctx.fillStyle;
            } catch {
              // keep existing
            }
          }
        }

        dst.style.setProperty(prop, val);
      }
    }
  } catch (inlineErr) {
    console.warn("Style inlining warning:", inlineErr);
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
        onclone: (clonedDoc: Document) => {
          // Remove all Next.js/Tailwind stylesheets from clone so html2canvas never encounters unparseable CSS
          const stylesheets = clonedDoc.querySelectorAll("style, link[rel='stylesheet']");
          stylesheets.forEach((s) => s.remove());

          const safeStyle = clonedDoc.createElement("style");
          safeStyle.textContent = `
            * {
              box-sizing: border-box !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            }
            body {
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          `;
          clonedDoc.head.appendChild(safeStyle);
        },
      },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    // Generate real PDF Blob
    // @ts-expect-error html2pdf is loosely typed
    const pdfBlob: Blob = await html2pdf().set(opt).from(clonedElement).output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);

    // 3. Mobile handling: Try native file share if supported (iOS / Android)
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
      } catch (shareError: any) {
        if (shareError.name === "AbortError") {
          URL.revokeObjectURL(blobUrl);
          return true;
        }
      }
    }

    // 4. Direct Anchor Download
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = cleanFilename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 3000);

    return true;
  } catch (error) {
    console.error("PDF generation error:", error);
    // Alert the user if error occurs rather than opening direct print dialog
    alert("Could not generate PDF download on this browser. Please try again or use Chrome.");
    return false;
  } finally {
    if (offscreenContainer.parentNode) {
      offscreenContainer.parentNode.removeChild(offscreenContainer);
    }
  }
}

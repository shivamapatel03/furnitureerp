/**
 * Utility to safely generate and download a PDF from a DOM element,
 * handling modern CSS color spaces (lab, oklch) that crash html2canvas.
 */
export async function downloadInvoicePdf(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return;
  }

  try {
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default || html2pdfModule;

    const opt = {
      margin: 0.2,
      filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        onclone: (clonedDoc: Document) => {
          const rootEl = clonedDoc.getElementById(elementId);
          if (!rootEl) return;

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          const allElements = [rootEl, ...Array.from(rootEl.querySelectorAll<HTMLElement>("*"))];

          allElements.forEach((el) => {
            const computed = window.getComputedStyle(el);
            for (let i = 0; i < computed.length; i++) {
              const prop = computed[i];
              if (
                prop.includes("color") ||
                prop.includes("background") ||
                prop.includes("border") ||
                prop.includes("fill") ||
                prop.includes("stroke") ||
                prop.includes("shadow")
              ) {
                const val = computed.getPropertyValue(prop);
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
                    el.style.setProperty(prop, ctx.fillStyle, "important");
                  } catch {
                    // ignore if unparseable
                  }
                }
              }
            }
          });
        },
      },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    // @ts-expect-error html2pdf is loosely typed
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.warn("html2pdf failed or encountered color issue, falling back to window.print():", error);
    // Graceful fallback to native device print/save as PDF dialog
    window.print();
  }
}

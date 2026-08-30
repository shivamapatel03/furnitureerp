const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable").default || require("jspdf-autotable");
const fs = require("fs");

const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });

// Dark Header Bar
doc.setFillColor(45, 45, 45);
doc.rect(0, 0, 210, 32, "F");

// Logo
const logoBase64 = "data:image/png;base64," + fs.readFileSync("src/logo/logo.png").toString("base64");
doc.setFillColor(255, 255, 255);
doc.roundedRect(12, 4.5, 23, 23, 2, 2, "F");
doc.addImage(logoBase64, "PNG", 13.5, 6, 20, 20, undefined, "FAST");

doc.setTextColor(255, 255, 255);
doc.setFontSize(16);
doc.setFont("helvetica", "bold");
doc.text("BHURJALA", 39, 14);

doc.setTextColor(239, 68, 68);
doc.setFontSize(10);
doc.setFont("helvetica", "bold");
doc.text("FURNITURE", 39, 22);

const tableData = [
  ["1", "Custom Sofa Set 3+2", "Unit Item", "Rs. 25,000", "1", "Rs. 25,000"],
  ["2", "Plywood Wardrobe", "Sqft (House)", "Rs. 1,200/sqft", "45 sqft", "Rs. 54,000"]
];

autoTable(doc, {
  startY: 50,
  head: [["#", "Item Description", "Type", "Rate", "Quantity / Sqft", "Amount"]],
  body: tableData,
  theme: "striped",
  headStyles: { fillColor: [45, 45, 45], textColor: [255, 255, 255], fontStyle: "bold" },
});

const buf = Buffer.from(doc.output("arraybuffer"));
console.log("Full vector Bill PDF with logo size:", buf.length, "bytes (" + (buf.length / 1024).toFixed(1) + " KB)");

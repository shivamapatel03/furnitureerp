const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

// 1. Without image
const doc1 = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
doc1.text("Hello World", 10, 10);
const buf1 = Buffer.from(doc1.output("arraybuffer"));
console.log("Size without image:", buf1.length, "bytes (~" + (buf1.length / 1024).toFixed(1) + " KB)");

// 2. With full PNG image
const doc2 = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
const logoBase64 = "data:image/png;base64," + fs.readFileSync("src/logo/logo.png").toString("base64");
doc2.addImage(logoBase64, "PNG", 10, 10, 20, 20, undefined, "FAST");
const buf2 = Buffer.from(doc2.output("arraybuffer"));
console.log("Size with full PNG:", buf2.length, "bytes (~" + (buf2.length / 1024 / 1024).toFixed(2) + " MB)");

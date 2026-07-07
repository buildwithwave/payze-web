import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Invoice } from "@/services/catalog";
import { formatMoney, formatDateTime } from "@/lib/format";

// Brand palette (matches --primary / logo #2563eb)
const INK: [number, number, number] = [17, 24, 39]; // gray-900
const MUTED: [number, number, number] = [107, 114, 128]; // gray-500
const FAINT: [number, number, number] = [156, 163, 175]; // gray-400
const BORDER: [number, number, number] = [229, 231, 235]; // gray-200
const PRIMARY: [number, number, number] = [37, 99, 235]; // blue-600
const PRIMARY_SOFT: [number, number, number] = [191, 219, 254]; // blue-200

/** Rasterize /logo.svg so jsPDF (no SVG support) can embed it. */
async function loadLogoPng(): Promise<string | null> {
  try {
    const res = await fetch("/logo.svg");
    if (!res.ok) return null;
    const svgText = await res.text();
    const blob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("logo load failed"));
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = 200; // 40x48 viewBox at 5x for crisp print
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/png");
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return null;
  }
}

/** One filled S-curve band across the page bottom. */
function drawWave(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  yStart: number,
  amplitude: number,
  endDrop: number,
  color: [number, number, number],
) {
  doc.setFillColor(...color);
  doc.lines(
    [
      // One smooth S from the left edge to the right edge
      [pageWidth * 0.35, -amplitude, pageWidth * 0.65, amplitude, pageWidth, endDrop],
      [0, pageHeight], // down past the bottom edge
      [-pageWidth, 0], // back to the left
    ],
    0,
    yStart,
    [1, 1],
    "F",
    true,
  );
}

export async function generateInvoicePDF(
  invoice: Invoice,
  storeName: string,
): Promise<Blob> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const right = pageWidth - margin;

  // The API sometimes returns number/null where the types promise a string,
  // and jsPDF.text throws on anything that isn't one.
  const invoiceNumber = String(invoice.number ?? invoice.id ?? "");

  doc.setFont("helvetica");

  // --- Top brand bar: logo + wordmark left, receipt meta right ---
  const logo = await loadLogoPng();
  if (logo) {
    doc.addImage(logo, "PNG", margin, 14, 7, 8.4);
  }
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PRIMARY);
  doc.text("payze", logo ? margin + 9 : margin, 20.5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...FAINT);
  doc.text("RECEIPT", right, 16, { align: "right" });
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(invoiceNumber, right, 21, { align: "right" });
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text(formatDateTime(invoice.createdAt), right, 25.5, { align: "right" });

  // Divider under the brand bar
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(margin, 31, right, 31);

  // --- Store / customer block ---
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text(storeName || "Payze Store", margin, 40);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text(
    invoice.customerName ? `Billed to ${invoice.customerName}` : "Walk-in customer",
    margin,
    45.5,
  );

  // --- Items table: borderless, hairline row rules ---
  const tableData = invoice.items.map((item) => [
    String(item.name ?? ""),
    String(item.quantity),
    `N${formatMoney(item.price)}`, // Helvetica has no naira glyph
    `N${formatMoney(item.price * item.quantity)}`,
  ]);

  autoTable(doc, {
    startY: 52,
    margin: { left: margin, right: margin },
    head: [["ITEM", "QTY", "PRICE", "TOTAL"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      textColor: FAINT,
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: { top: 2.5, bottom: 2.5, left: 0, right: 2 },
    },
    bodyStyles: {
      textColor: INK,
      fontSize: 9.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 0, right: 2 },
    },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right", fontStyle: "bold" },
    },
    // columnStyles only cover the body — align the head cells to match
    didParseCell: (data) => {
      if (data.section === "head" && data.column.index > 0) {
        data.cell.styles.halign = data.column.index === 1 ? "center" : "right";
      }
    },
    didDrawCell: (data) => {
      if (data.section === "head" && data.column.index === 0) {
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.3);
        doc.line(
          margin,
          data.cell.y + data.cell.height,
          right,
          data.cell.y + data.cell.height,
        );
      }
      if (data.section === "body" && data.column.index === 0) {
        doc.setDrawColor(243, 244, 246); // gray-100 hairline
        doc.setLineWidth(0.15);
        doc.line(
          margin,
          data.cell.y + data.cell.height,
          right,
          data.cell.y + data.cell.height,
        );
      }
    },
  });

  // --- Totals block, right-aligned ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let y = (doc as any).lastAutoTable.finalY + 9;
  const labelX = right - 52;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("Subtotal", labelX, y);
  doc.setTextColor(...INK);
  doc.text(`N${formatMoney(invoice.subtotal)}`, right, y, { align: "right" });
  y += 5.5;

  if (invoice.discount > 0) {
    doc.setTextColor(...MUTED);
    doc.text("Discount", labelX, y);
    doc.setTextColor(...INK);
    doc.text(`-N${formatMoney(invoice.discount)}`, right, y, { align: "right" });
    y += 5.5;
  }

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(labelX, y, right, y);
  y += 6;

  doc.setFontSize(12.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Total", labelX, y);
  doc.setTextColor(...PRIMARY);
  doc.text(`N${formatMoney(invoice.total)}`, right, y, { align: "right" });
  y += 7.5;

  const paymentLabels: Record<string, string> = {
    cash: "Cash",
    nomba: "Nomba",
    transfer: "Bank Transfer",
    card: "Card",
  };
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text(
    `Paid via ${paymentLabels[invoice.paymentMethod] || invoice.paymentMethod}`,
    labelX,
    y,
  );
  if (invoice.amountTendered !== undefined) {
    doc.text(`N${formatMoney(invoice.amountTendered)}`, right, y, {
      align: "right",
    });
    y += 5;
  }
  if (invoice.change !== undefined && invoice.change > 0) {
    doc.text("Change", labelX, y);
    doc.text(`N${formatMoney(invoice.change)}`, right, y, { align: "right" });
  }

  // --- Footer: thank-you note above layered brand waves ---
  doc.setFontSize(9);
  doc.setTextColor(...FAINT);
  doc.text("Thank you for shopping with us", pageWidth / 2, pageHeight - 32, {
    align: "center",
  });

  drawWave(doc, pageWidth, pageHeight, pageHeight - 22, 7, -4, PRIMARY_SOFT);
  drawWave(doc, pageWidth, pageHeight, pageHeight - 16, 8, 5, PRIMARY);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text("Powered by Payze", pageWidth / 2, pageHeight - 5.5, {
    align: "center",
  });

  return doc.output("blob");
}

export async function downloadInvoicePDF(invoice: Invoice, storeName: string) {
  const blob = await generateInvoicePDF(invoice, storeName);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Receipt-${invoice.number || invoice.id}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

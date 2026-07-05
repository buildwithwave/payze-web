import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Invoice } from "@/services/catalog";
import { formatMoney, formatDateTime } from "@/lib/format";

export function generateInvoicePDF(invoice: Invoice, storeName: string): Blob {
  // Create a new PDF document in portrait mode, A4 size
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Set font
  doc.setFont("helvetica");

  // --- Header ---
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(storeName || "Payze Store", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Receipt ${invoice.number}`, pageWidth / 2, 26, { align: "center" });
  doc.text(formatDateTime(invoice.createdAt), pageWidth / 2, 31, { align: "center" });

  if (invoice.customerName) {
    doc.text(`Customer: ${invoice.customerName}`, pageWidth / 2, 36, { align: "center" });
  }

  // --- Items Table ---
  const tableData = invoice.items.map((item) => [
    item.name,
    item.quantity.toString(),
    `N${formatMoney(item.price)}`, // Using N for Naira symbol in basic PDF fonts
    `N${formatMoney(item.price * item.quantity)}`,
  ]);

  autoTable(doc, {
    startY: invoice.customerName ? 45 : 40,
    head: [["ITEM", "QTY", "PRICE", "TOTAL"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: [249, 250, 251], // gray-50
      textColor: [107, 114, 128], // gray-500
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      textColor: [17, 24, 39], // gray-900
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    didDrawCell: (data) => {
      // Add subtle bottom border to body rows
      if (data.section === "body") {
        doc.setDrawColor(243, 244, 246); // gray-100
        doc.setLineWidth(0.1);
        doc.line(
          data.cell.x,
          data.cell.y + data.cell.height,
          data.cell.x + data.cell.width,
          data.cell.y + data.cell.height
        );
      }
    },
  });

  // --- Totals Section ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  
  // Subtotal
  doc.text("Subtotal:", pageWidth - 60, finalY);
  doc.text(`N${formatMoney(invoice.subtotal)}`, pageWidth - 14, finalY, { align: "right" });

  let currentY = finalY + 6;

  // Discount
  if (invoice.discount > 0) {
    doc.text("Discount:", pageWidth - 60, currentY);
    doc.text(`-N${formatMoney(invoice.discount)}`, pageWidth - 14, currentY, { align: "right" });
    currentY += 6;
  }

  // Divider
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(pageWidth - 60, currentY, pageWidth - 14, currentY);
  currentY += 6;

  // Total
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total:", pageWidth - 60, currentY);
  doc.text(`N${formatMoney(invoice.total)}`, pageWidth - 14, currentY, { align: "right" });

  currentY += 10;
  
  // Payment Info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  
  const paymentLabels: Record<string, string> = {
    cash: "Cash",
    transfer: "Bank Transfer",
    card: "Card",
  };
  
  doc.text(`Paid via ${paymentLabels[invoice.paymentMethod] || invoice.paymentMethod}`, pageWidth - 60, currentY);
  if (invoice.amountTendered !== undefined) {
    doc.text(`N${formatMoney(invoice.amountTendered)}`, pageWidth - 14, currentY, { align: "right" });
    currentY += 6;
  }
  
  if (invoice.change !== undefined && invoice.change > 0) {
    doc.text("Change:", pageWidth - 60, currentY);
    doc.text(`N${formatMoney(invoice.change)}`, pageWidth - 14, currentY, { align: "right" });
  }

  // --- Footer ---
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text("Thank you for shopping with us", pageWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });

  return doc.output("blob");
}

export function downloadInvoicePDF(invoice: Invoice, storeName: string) {
  const blob = generateInvoicePDF(invoice, storeName);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Receipt-${invoice.number || invoice.id}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

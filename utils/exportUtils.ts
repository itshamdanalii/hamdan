
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Bill, Settings, Expense } from '../types';
import { format } from 'date-fns';

export const generateBillPDF = (bill: Bill, settings: Settings) => {
  const doc = new jsPDF() as any;

  // Header
  doc.setFontSize(20);
  doc.text(settings.shopName, 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Phone: ${settings.shopPhone}`, 105, 28, { align: 'center' });
  
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // Bill Info
  doc.text(`Bill No: ${bill.billNumber}`, 20, 45);
  doc.text(`Date: ${format(bill.date, 'dd/MM/yyyy HH:mm')}`, 190, 45, { align: 'right' });
  doc.text(`Payment Mode: ${bill.paymentMode}`, 20, 52);

  // Items Table
  const tableData = bill.items.map((item, idx) => [
    idx + 1,
    item.name,
    item.price.toFixed(2),
    item.quantity,
    item.total.toFixed(2)
  ]);

  doc.autoTable({
    startY: 60,
    head: [['#', 'Item Name', 'Price', 'Qty', 'Total']],
    body: tableData,
    foot: [['', '', '', 'Grand Total', bill.total.toFixed(2)]],
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85] },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.text('Thank you for your business!', 105, finalY + 20, { align: 'center' });

  return doc;
};

export const exportToExcel = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const generateReportPDF = (title: string, data: any[], settings: Settings) => {
  const doc = new jsPDF() as any;
  doc.setFontSize(16);
  doc.text(settings.shopName, 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text(title, 105, 25, { align: 'center' });
  
  const headers = Object.keys(data[0] || {});
  const rows = data.map(item => Object.values(item));

  doc.autoTable({
    startY: 35,
    head: [headers],
    body: rows,
    theme: 'striped',
  });

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

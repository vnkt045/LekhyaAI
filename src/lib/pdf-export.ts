import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFExportOptions {
    title: string;
    subtitle?: string;
    data: any[];
    columns: { header: string; dataKey: string }[];
    filename: string;
    orientation?: 'portrait' | 'landscape';
}

export function exportToPDF(options: PDFExportOptions) {
    const { title, subtitle, data, columns, filename, orientation = 'portrait' } = options;

    const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4'
    });

    // Add header
    doc.setFontSize(18);
    doc.setTextColor(10, 25, 41); // Navy color
    doc.text(title, 14, 20);

    if (subtitle) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(subtitle, 14, 28);
    }

    // Add company info (if available)
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('LekhyaAI - Intelligent Accounting', 14, subtitle ? 34 : 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, subtitle ? 38 : 32);

    // Add table
    autoTable(doc, {
        startY: subtitle ? 44 : 38,
        head: [columns.map(col => col.header)],
        body: data.map(row => columns.map(col => row[col.dataKey] || '')),
        theme: 'grid',
        headStyles: {
            fillColor: [10, 25, 41], // Navy
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [50, 50, 50]
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        margin: { top: 10, right: 14, bottom: 10, left: 14 }
    });

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // Save PDF
    doc.save(filename);
}

// Export summary report with totals
export function exportSummaryPDF(options: {
    title: string;
    subtitle?: string;
    summaryData: { label: string; value: string | number }[];
    tableData?: any[];
    tableColumns?: { header: string; dataKey: string }[];
    filename: string;
}) {
    const { title, subtitle, summaryData, tableData, tableColumns, filename } = options;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Header
    doc.setFontSize(18);
    doc.setTextColor(10, 25, 41);
    doc.text(title, 14, 20);

    if (subtitle) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(subtitle, 14, 28);
    }

    let yPos = subtitle ? 40 : 34;

    // Summary section
    doc.setFontSize(12);
    doc.setTextColor(10, 25, 41);
    doc.text('Summary', 14, yPos);
    yPos += 8;

    doc.setFontSize(9);
    summaryData.forEach(item => {
        doc.setTextColor(80, 80, 80);
        doc.text(item.label, 14, yPos);
        doc.setTextColor(10, 25, 41);
        doc.setFont('helvetica', 'bold');
        doc.text(String(item.value), 100, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 6;
    });

    // Table section (if provided)
    if (tableData && tableColumns) {
        yPos += 10;
        autoTable(doc, {
            startY: yPos,
            head: [tableColumns.map(col => col.header)],
            body: tableData.map(row => tableColumns.map(col => row[col.dataKey] || '')),
            theme: 'grid',
            headStyles: {
                fillColor: [10, 25, 41],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            }
        });
    }

    doc.save(filename);
}

import * as XLSX from 'xlsx';

interface ExcelExportOptions {
    data: any[];
    sheetName: string;
    filename: string;
}

export function exportToExcel(options: ExcelExportOptions) {
    const { data, sheetName, filename } = options;

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Save file
    XLSX.writeFile(wb, filename);
}

// Export multiple sheets
export function exportMultiSheetExcel(options: {
    sheets: { name: string; data: any[] }[];
    filename: string;
}) {
    const { sheets, filename } = options;

    const wb = XLSX.utils.book_new();

    sheets.forEach(sheet => {
        const ws = XLSX.utils.json_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });

    XLSX.writeFile(wb, filename);
}

// Import from Excel
export async function importFromExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                // Get first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsBinaryString(file);
    });
}

// Generate import template
export function generateImportTemplate(
    columns: string[],
    sheetName: string,
    filename: string
) {
    // Create header row
    const headerRow: any = {};
    columns.forEach(col => {
        headerRow[col] = '';
    });

    const ws = XLSX.utils.json_to_sheet([headerRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    XLSX.writeFile(wb, filename);
}

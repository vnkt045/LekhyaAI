
/**
 * Extracts structured data from raw OCR text using Regex patterns.
 * Optimized for Indian Invoice formats.
 */

export interface ExtractedInvoiceData {
    date?: string;
    invoiceNumber?: string;
    gstin?: string;
    amount?: number;
    rawText: string;
}

export function parseInvoiceText(text: string): ExtractedInvoiceData {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const data: ExtractedInvoiceData = { rawText: text };

    // 1. Extract Date
    // Matches: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD.MM.YYYY, 08-01-2026
    const datePattern = /(\d{1,2}[\.\/\-\s]\d{1,2}[\.\/\-\s]\d{2,4})|(\d{4}[\.\/\-\s]\d{1,2}[\.\/\-\s]\d{1,2})/i;
    const dateMatch = text.match(datePattern);
    if (dateMatch) {
        // Normalize spacers
        data.date = dateMatch[0].replace(/[\.\s]/g, '-');
    }

    // 2. Extract GSTIN
    const gstinPattern = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/;
    const gstinMatch = text.match(gstinPattern);
    if (gstinMatch) {
        data.gstin = gstinMatch[0];
    }

    // 3. Extract Invoice Number
    // Look for various labels often found in Indian invoices
    // "Tax Invoice No", "Invoice No", "Bill No", "Memo No"
    const invLabelPattern = /(?:tax\s*)?invoice\s*(?:no\.?|num\.?|number)|bill\s*(?:no\.?|num\.?)|memo\s*(?:no\.?)/i;

    for (const line of lines) {
        if (invLabelPattern.test(line)) {
            // Remove the label and take the rest
            const cleanLine = line.replace(invLabelPattern, '').replace(/[:#]/g, '').trim();
            if (cleanLine.length > 0) {
                // Often OCR puts the number right after, or separated by space. 
                // We take the first meaningful chunk.
                // Example: "RPI 2526/11142 M/s." -> "RPI 2526/11142"
                // Heuristic: Take up to 2 words if they look alphanumeric
                const parts = cleanLine.split(/\s+/);
                if (parts.length > 0) {
                    // specific for the user's image "RPI 2526/11142"
                    if (parts.length > 1 && parts[1].includes('/')) {
                        data.invoiceNumber = `${parts[0]} ${parts[1]}`;
                    } else {
                        data.invoiceNumber = parts[0];
                    }
                }
                break;
            }
        }
    }

    // 4. Extract Total Amount
    // Scanning from bottom up is good.
    // Look for "Total", "Grand Total", "Net Amount"
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (/(grand|net|final|invoice)?\s*(total|amount|payable)/i.test(line) && /\d/.test(line)) {
            // Extract all numbers. Handle "1,234.00" and "1.234,00" confusion? 
            // Standardizing to: remove all non-digit-dot chars, but keep dot if it's a decimal.
            // Indian regex: digits, maybe commas, then dot then 2 digits.
            const matches = line.match(/[\d,]+\.\d{2}/g);
            if (matches && matches.length > 0) {
                const values = matches.map(m => parseFloat(m.replace(/,/g, '')));
                const maxVal = Math.max(...values);
                if (maxVal > 0) {
                    data.amount = maxVal;
                    break;
                }
            }
        }
    }

    return data;
}

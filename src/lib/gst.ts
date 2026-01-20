
export const GST_RATES = [0, 5, 12, 18, 28];

export interface TaxBreakdown {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
    totalAmount: number;
}

/**
 * Validates a GSTIN (Goods and Services Tax Identification Number)
 * Format: 2 digits(State) + 10 chars(PAN) + 1 digit + 1 char + 1 char
 */
export function validateGSTIN(gstin: string): boolean {
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return regex.test(gstin);
}

/**
 * Calculates GST components based on rate and place of supply
 * @param amount Total transaction amount (inclusive or exclusive logic to be handled by caller, currently treating as taxable base)
 * @param rate GST Rate (e.g., 18)
 * @param isInterState If true, applies IGST. If false, applies CGST + SGST.
 */
export function calculateTax(amount: number, rate: number, isInterState: boolean = false): TaxBreakdown {
    const taxAmount = (amount * rate) / 100;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
        igst = taxAmount;
    } else {
        cgst = taxAmount / 2;
        sgst = taxAmount / 2;
    }

    return {
        taxableValue: amount,
        cgst: parseFloat(cgst.toFixed(2)),
        sgst: parseFloat(sgst.toFixed(2)),
        igst: parseFloat(igst.toFixed(2)),
        totalTax: parseFloat(taxAmount.toFixed(2)),
        totalAmount: parseFloat((amount + taxAmount).toFixed(2))
    };
}


import { calculateTax, validateGSTIN } from './gst';

describe('GST Utilities', () => {
    describe('validateGSTIN', () => {
        test('should validate correct GSTIN format', () => {
            const valid = '29ABCDE1234F1Z5';
            expect(validateGSTIN(valid)).toBe(true);
        });

        test('should reject invalid GSTIN', () => {
            const invalid = 'INVALID_GSTIN';
            expect(validateGSTIN(invalid)).toBe(false);
        });
    });

    describe('calculateTax', () => {
        const AMOUNT = 1000;
        const RATE = 18;

        test('should split tax into CGST and SGST for intra-state', () => {
            const result = calculateTax(AMOUNT, RATE, false);
            expect(result.taxableValue).toBe(1000);
            expect(result.totalTax).toBe(180);
            expect(result.cgst).toBe(90);
            expect(result.sgst).toBe(90);
            expect(result.igst).toBe(0);
            expect(result.totalAmount).toBe(1180);
        });

        test('should use IGST for inter-state', () => {
            const result = calculateTax(AMOUNT, RATE, true);
            expect(result.taxableValue).toBe(1000);
            expect(result.totalTax).toBe(180);
            expect(result.cgst).toBe(0);
            expect(result.sgst).toBe(0);
            expect(result.igst).toBe(180);
            expect(result.totalAmount).toBe(1180);
        });
    });
});

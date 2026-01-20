
import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
import { parseInvoiceText } from '@/lib/invoice-parser';

export async function POST(req: Request) {
    try {
        console.log('AI Scan Voucher API called');
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error('No file uploaded');
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        console.log('File received:', file.name, file.type, file.size);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log('Starting OCR processing...');

        // Perform OCR - simplified without workerPath
        const { data: { text } } = await Tesseract.recognize(buffer, 'eng', {
            logger: m => console.log('Tesseract:', m)
        });

        console.log('OCR completed. Text length:', text?.length || 0);

        if (!text || text.trim().length === 0) {
            console.warn('No text extracted from image');
            return NextResponse.json({
                text: '',
                extracted: {
                    date: null,
                    invoiceNumber: null,
                    amount: null,
                    vendor: null
                }
            });
        }

        // Extract Data using Heuristics/Regex
        const extractedData = parseInvoiceText(text);
        console.log('Extracted data:', extractedData);

        return NextResponse.json({
            text,
            extracted: extractedData
        });

    } catch (error) {
        console.error('OCR Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Failed to process image',
            details: errorMessage
        }, { status: 500 });
    }
}


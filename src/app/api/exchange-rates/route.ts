import { NextResponse } from 'next/server';

// Exchangerate.host - Free, unlimited, no API key required
// Supports 170+ currencies with real-time updates
const EXCHANGE_API_URL = 'https://api.exchangerate.host';

// Cache for exchange rates (24 hour TTL)
let rateCache: {
    rates: any;
    timestamp: number;
    baseCurrency: string;
} | null = null;

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const base = searchParams.get('base') || 'USD';
        const target = searchParams.get('target');

        // Check cache
        const now = Date.now();
        if (rateCache &&
            rateCache.baseCurrency === base &&
            (now - rateCache.timestamp) < CACHE_DURATION) {

            if (target) {
                // Return specific conversion
                const rate = rateCache.rates[target];
                if (!rate) {
                    return NextResponse.json({ error: 'Target currency not found' }, { status: 404 });
                }
                return NextResponse.json({
                    base,
                    target,
                    rate,
                    lastUpdated: new Date(rateCache.timestamp).toISOString(),
                    cached: true
                });
            }

            // Return all rates
            return NextResponse.json({
                base,
                rates: rateCache.rates,
                lastUpdated: new Date(rateCache.timestamp).toISOString(),
                cached: true
            });
        }

        // Fetch fresh rates from exchangerate.host
        const response = await fetch(`${EXCHANGE_API_URL}/latest?base=${base}`);

        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error?.info || 'API returned error');
        }

        // Update cache
        rateCache = {
            rates: data.rates,
            timestamp: now,
            baseCurrency: base
        };

        if (target) {
            const rate = data.rates[target];
            if (!rate) {
                return NextResponse.json({ error: 'Target currency not found' }, { status: 404 });
            }
            return NextResponse.json({
                base,
                target,
                rate,
                lastUpdated: new Date(now).toISOString(),
                cached: false
            });
        }

        return NextResponse.json({
            base,
            rates: data.rates,
            lastUpdated: new Date(now).toISOString(),
            cached: false,
            source: 'exchangerate.host'
        });
    } catch (error: any) {
        console.error('Exchange rate API error:', error);
        return NextResponse.json({
            error: 'Failed to fetch exchange rates',
            message: error.message
        }, { status: 500 });
    }
}

// POST: Convert amount between currencies
export async function POST(req: Request) {
    try {
        const { amount, from, to } = await req.json();

        if (!amount || !from || !to) {
            return NextResponse.json({
                error: 'Missing required fields: amount, from, to'
            }, { status: 400 });
        }

        // Use exchangerate.host convert endpoint
        const response = await fetch(
            `${EXCHANGE_API_URL}/convert?from=${from}&to=${to}&amount=${amount}`
        );

        if (!response.ok) {
            throw new Error('Failed to convert currency');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error?.info || 'Conversion failed');
        }

        return NextResponse.json({
            from,
            to,
            amount,
            rate: data.info.rate,
            converted: data.result,
            timestamp: new Date(data.date).toISOString(),
            source: 'exchangerate.host'
        });
    } catch (error: any) {
        console.error('Currency conversion error:', error);
        return NextResponse.json({
            error: 'Failed to convert currency',
            message: error.message
        }, { status: 500 });
    }
}

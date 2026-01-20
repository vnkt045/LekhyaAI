import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// CONSTANTS - Feature Matrix
const PLAN_FEATURES: Record<string, string[]> = {
    'SILVER': ['core_accounting', 'gst_reports', 'banking_basic'],
    'GOLD': ['core_accounting', 'gst_reports', 'banking_basic', 'inventory_basic', 'inventory_advanced', 'e_invoicing'],
    'PLATINUM': ['core_accounting', 'gst_reports', 'banking_basic', 'inventory_basic', 'inventory_advanced', 'e_invoicing', 'multi_currency', 'payroll_access', 'audit_trail', 'ai_insights', 'api_access']
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const signature = req.headers.get('x-razorpay-signature');

        // 1. Validate Signature (Mock logic until real secret is set)
        // const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!);
        // shasum.update(JSON.stringify(body));
        // if (shasum.digest('hex') !== signature) return new NextResponse('Invalid Signature', { status: 400 });

        console.log('Payment Webhook Received:', body);

        // 2. Extract Data (Assuming standard Razorpay/Stripe payload structure or a simplified custom one)
        // For "Connection Ready", we'll accept a simplified payload that mimics what a gateway sends
        const { email, planId, transactionId, gateway, amount } = body.payload?.payment?.entity || body;

        if (!email || !planId) {
            return new NextResponse('Missing email or planId', { status: 400 });
        }

        // 3. Find Company/User
        // In this MVP, we link subscription to the FIRST company found for the user (or passed companyId)
        // Ideally, the payment metadata should contain `companyId`.
        let companyId = body.payload?.payment?.entity?.notes?.companyId || body.companyId;

        if (!companyId) {
            // Fallback: Find user by email and get their first company
            const user = await db.user.findUnique({ where: { email } });
            if (!user) return new NextResponse('User not found', { status: 404 });

            // This is a simplification. Real apps might have multiple companies.
            const company = await db.company.findFirst(); // In single-tenant/local, this is fine
            if (!company) return new NextResponse('Company not found', { status: 404 });
            companyId = company.id;
        }

        // 4. Calculate Dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // 1 Year validity

        // 5. Upsert Subscription
        const features = PLAN_FEATURES[planId.toUpperCase()] || PLAN_FEATURES['SILVER'];

        const subscription = await db.subscription.upsert({
            where: { companyId },
            update: {
                planId: planId.toUpperCase(),
                status: 'ACTIVE',
                startDate,
                endDate,
                paymentGateway: gateway || 'RAZORPAY',
                transactionId: transactionId || 'TXN_' + Date.now(),
                amountPaid: parseFloat(amount) || 0,
                allowedFeatures: JSON.stringify(features)
            },
            create: {
                companyId,
                planId: planId.toUpperCase(),
                status: 'ACTIVE',
                startDate,
                endDate,
                paymentGateway: gateway || 'RAZORPAY',
                transactionId: transactionId || 'TXN_' + Date.now(),
                amountPaid: parseFloat(amount) || 0,
                allowedFeatures: JSON.stringify(features)
            }
        });

        return NextResponse.json({ success: true, subscriptionId: subscription.id });

    } catch (error) {
        console.error('Webhook Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

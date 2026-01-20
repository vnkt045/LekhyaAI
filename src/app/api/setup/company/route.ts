import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // In a single tenant system, we just take the first company
        const company = await db.company.findFirst();

        if (!company) {
            return NextResponse.json({
                name: 'Your Company Name',
                address: 'Your Address',
                city: 'City',
                state: 'State',
                pincode: '000000',
                gstin: 'GSTIN Not Set'
            });
        }

        return NextResponse.json(company);
    } catch (error) {
        console.error('Failed to fetch company details:', error);
        return NextResponse.json({ error: 'Failed to fetch company details' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();

        // Single Tenant check: If company exists, don't create another
        const existing = await db.company.findFirst();
        if (existing) {
            return NextResponse.json({ error: 'Company already exists. Use PUT to update.' }, { status: 400 });
        }

        const company = await db.company.create({
            data: {
                name: body.name,
                gstin: body.gstin,
                pan: body.pan,
                address: body.address,
                city: body.city,
                state: body.state,
                pincode: body.pincode,
                email: body.email,
                phone: body.phone,
                financialYearStart: new Date(body.financialYearStart),
                financialYearEnd: new Date(body.financialYearEnd),
                // Create default subscription
                subscription: {
                    create: {
                        status: 'ACTIVE',
                        planId: 'FREE',
                        startDate: new Date(),
                        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)), // 10 years free
                        allowedFeatures: '["all"]'
                    }
                }
            }
        });

        return NextResponse.json(company);
    } catch (error) {
        console.error('Create Company Error:', error);
        return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();

        // Find existing to update (Single Tenant approach often ignores ID in body and finds the only record)
        const existing = await db.company.findFirst();

        if (!existing) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        const company = await db.company.update({
            where: { id: existing.id },
            data: {
                name: body.name,
                gstin: body.gstin,
                pan: body.pan,
                address: body.address,
                city: body.city,
                state: body.state,
                pincode: body.pincode,
                email: body.email,
                phone: body.phone,
                financialYearStart: body.financialYearStart ? new Date(body.financialYearStart) : undefined,
                financialYearEnd: body.financialYearEnd ? new Date(body.financialYearEnd) : undefined,
            }
        });

        return NextResponse.json(company);
    } catch (error) {
        console.error('Update Company Error:', error);
        return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
    }
}


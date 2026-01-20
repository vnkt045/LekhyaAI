
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
        // Assume single company for now (or find the first one)
        const company = await db.company.findFirst({
            include: { subscription: true }
        });
        return NextResponse.json(company || {});
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Find existing company to update or create new
        const company = await db.company.findFirst();

        let updatedCompany;

        if (company) {
            updatedCompany = await db.company.update({
                where: { id: company.id },
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
                    // Settings
                    voucherPrefix: body.voucherPrefix,
                    isAutoNumbering: body.isAutoNumbering,
                    dateFormat: body.dateFormat
                }
            });
        } else {
            updatedCompany = await db.company.create({
                data: {
                    name: body.name || 'My Company',
                    gstin: body.gstin,
                    pan: body.pan,
                    address: body.address || '',
                    city: body.city || '',
                    state: body.state || '',
                    pincode: body.pincode || '',
                    email: body.email || '',
                    phone: body.phone || '',
                    financialYearStart: new Date(body.financialYearStart || new Date()),
                    financialYearEnd: new Date(body.financialYearEnd || new Date()),
                    // Settings
                    voucherPrefix: body.voucherPrefix || 'VCH',
                    isAutoNumbering: body.isAutoNumbering !== undefined ? body.isAutoNumbering : true,
                    dateFormat: body.dateFormat || 'DD-MM-YYYY'
                }
            });
        }

        return NextResponse.json(updatedCompany);
    } catch (error) {
        console.error('Failed to update settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}

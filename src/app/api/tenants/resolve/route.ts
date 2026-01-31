import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Resolve tenant by slug
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ error: 'Slug parameter required' }, { status: 400 });
        }

        // Find company by slug
        const company = await db.company.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                email: true,
                licenseKey: {
                    select: {
                        status: true,
                        paymentStatus: true
                    }
                }
            }
        });

        if (!company) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Check if tenant is active
        if (company.licenseKey?.status === 'DISABLED') {
            return NextResponse.json({
                error: 'Tenant is disabled',
                status: 'DISABLED'
            }, { status: 403 });
        }

        return NextResponse.json({
            tenant: company,
            active: company.licenseKey?.status === 'ACTIVE'
        });
    } catch (error) {
        console.error('Failed to resolve tenant:', error);
        return NextResponse.json({ error: 'Failed to resolve tenant' }, { status: 500 });
    }
}

// POST: Generate slug for company
export async function POST(req: Request) {
    try {
        const { companyId, name } = await req.json();

        if (!companyId || !name) {
            return NextResponse.json({
                error: 'Missing required fields: companyId, name'
            }, { status: 400 });
        }

        // Generate slug from company name
        const baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Check if slug exists
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await db.company.findUnique({
                where: { slug }
            });

            if (!existing || existing.id === companyId) {
                break;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Update company with slug
        const company = await db.company.update({
            where: { id: companyId },
            data: { slug }
        });

        return NextResponse.json({
            slug: company.slug,
            url: `/masters/${company.slug}`
        });
    } catch (error) {
        console.error('Failed to generate slug:', error);
        return NextResponse.json({ error: 'Failed to generate slug' }, { status: 500 });
    }
}

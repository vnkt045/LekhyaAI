import { db } from '@/lib/db';

/**
 * Resolve tenant by slug from URL
 * Usage: const tenant = await resolveTenantBySlug('acme-corp');
 */
export async function resolveTenantBySlug(slug: string) {
    try {
        const company = await db.company.findUnique({
            where: { slug },
            include: {
                licenseKey: true,
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true
                            }
                        }
                    }
                }
            }
        });

        if (!company) {
            return null;
        }

        // Check if tenant is active
        if (company.licenseKey?.status === 'DISABLED') {
            throw new Error('Tenant is disabled');
        }

        if (company.licenseKey?.status === 'EXPIRED') {
            throw new Error('Tenant license has expired');
        }

        return company;
    } catch (error) {
        console.error('Failed to resolve tenant:', error);
        throw error;
    }
}

/**
 * Generate unique slug for company
 * Usage: const slug = await generateCompanySlug('Acme Corporation');
 */
export async function generateCompanySlug(name: string): Promise<string> {
    const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await db.company.findUnique({
            where: { slug }
        });

        if (!existing) {
            break;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

/**
 * Extract tenant slug from URL path
 * Usage: const slug = extractTenantSlug('/masters/acme-corp/dashboard');
 * Returns: 'acme-corp'
 */
export function extractTenantSlug(pathname: string): string | null {
    const match = pathname.match(/^\/masters\/([^\/]+)/);
    return match ? match[1] : null;
}

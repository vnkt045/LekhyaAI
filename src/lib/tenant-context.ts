/**
 * Tenant Context Provider
 * Ensures all database queries are automatically scoped to the current tenant
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export interface TenantContext {
    tenantId: string;
    userId: string;
    userRole: string;
    tenant: {
        id: string;
        name: string;
        subscriptionPlan: string;
        status: string;
        enabledModules: string;
    };
}

/**
 * Get the current tenant context from the authenticated session
 * Throws error if user is not authenticated or not associated with a tenant
 */
export async function getTenantContext(): Promise<TenantContext> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        throw new Error('Unauthorized: No active session');
    }

    // Get user with tenant information
    const user = await db.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            role: true,
            // Note: tenantId will be added in migration
            // For now, we'll use a default system tenant
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    // TODO: After migration, uncomment this:
    // if (!user.tenantId) {
    //     throw new Error('User not associated with a tenant');
    // }

    // For now, return a mock context until migration is complete
    // This will be replaced with actual tenant data after schema update
    return {
        tenantId: 'system-tenant', // Will be user.tenantId after migration
        userId: user.id,
        userRole: user.role,
        tenant: {
            id: 'system-tenant',
            name: 'System',
            subscriptionPlan: 'ENTERPRISE',
            status: 'ACTIVE',
            enabledModules: JSON.stringify(['all']),
        },
    };
}

/**
 * Validate that a resource belongs to the current tenant
 */
export async function validateTenantAccess(
    resourceTenantId: string,
    context?: TenantContext
): Promise<boolean> {
    const tenantContext = context || await getTenantContext();

    if (resourceTenantId !== tenantContext.tenantId) {
        throw new Error('Forbidden: Resource does not belong to your tenant');
    }

    return true;
}

/**
 * Check if current tenant has access to a specific module
 */
export async function hasModuleAccess(moduleName: string): Promise<boolean> {
    const { tenant } = await getTenantContext();

    try {
        const enabledModules = JSON.parse(tenant.enabledModules);
        return enabledModules.includes(moduleName) || enabledModules.includes('all');
    } catch {
        return false;
    }
}

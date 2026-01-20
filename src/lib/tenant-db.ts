/**
 * Tenant-Aware Database Helpers
 * Automatically scope all queries to the current tenant
 */

import { getTenantContext } from './tenant-context';
import { db } from './db';

/**
 * Find many records with automatic tenant filtering
 */
export async function findManyWithTenant<T>(
    model: any,
    options: any = {}
): Promise<T[]> {
    const { tenantId } = await getTenantContext();

    return model.findMany({
        ...options,
        where: {
            ...options.where,
            tenantId,
        },
    });
}

/**
 * Find unique record with tenant validation
 */
export async function findUniqueWithTenant<T>(
    model: any,
    where: any
): Promise<T | null> {
    const { tenantId } = await getTenantContext();

    const record = await model.findUnique({ where });

    // Validate tenant ownership
    if (record && record.tenantId && record.tenantId !== tenantId) {
        throw new Error('Forbidden: Resource does not belong to your tenant');
    }

    return record;
}

/**
 * Create record with automatic tenant assignment
 */
export async function createWithTenant<T>(
    model: any,
    data: any
): Promise<T> {
    const { tenantId } = await getTenantContext();

    return model.create({
        data: {
            ...data,
            tenantId,
        },
    });
}

/**
 * Update record with tenant validation
 */
export async function updateWithTenant<T>(
    model: any,
    where: any,
    data: any
): Promise<T> {
    const { tenantId } = await getTenantContext();

    // First verify the record belongs to this tenant
    const existing = await model.findUnique({ where });

    if (!existing) {
        throw new Error('Record not found');
    }

    if (existing.tenantId && existing.tenantId !== tenantId) {
        throw new Error('Forbidden: Cannot update resource from another tenant');
    }

    return model.update({
        where,
        data,
    });
}

/**
 * Delete record with tenant validation
 */
export async function deleteWithTenant<T>(
    model: any,
    where: any
): Promise<T> {
    const { tenantId } = await getTenantContext();

    // First verify the record belongs to this tenant
    const existing = await model.findUnique({ where });

    if (!existing) {
        throw new Error('Record not found');
    }

    if (existing.tenantId && existing.tenantId !== tenantId) {
        throw new Error('Forbidden: Cannot delete resource from another tenant');
    }

    return model.delete({ where });
}

/**
 * Count records with tenant filtering
 */
export async function countWithTenant(
    model: any,
    where: any = {}
): Promise<number> {
    const { tenantId } = await getTenantContext();

    return model.count({
        where: {
            ...where,
            tenantId,
        },
    });
}

/**
 * Aggregate with tenant filtering
 */
export async function aggregateWithTenant(
    model: any,
    options: any = {}
): Promise<any> {
    const { tenantId } = await getTenantContext();

    return model.aggregate({
        ...options,
        where: {
            ...options.where,
            tenantId,
        },
    });
}

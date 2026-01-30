import { db } from './db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface AuditLogParams {
    entityType: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    oldValue?: any;
    newValue?: any;
    req?: Request;
    description?: string;
}

/**
 * Log an audit trail entry
 * This function is called automatically for all CRUD operations
 * Cannot be disabled - MCA compliance requirement
 */
export async function logAudit(params: AuditLogParams) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            console.warn('Audit log attempted without user session');
            // Still log the action but with "SYSTEM" as user
            await createAuditLog({
                ...params,
                userId: 'SYSTEM',
                userName: 'System',
                userEmail: 'system@lekhyaai.com'
            });
            return;
        }

        // Calculate specific changes for UPDATE
        let changes = null;
        if (params.action === 'UPDATE' && params.oldValue && params.newValue) {
            changes = calculateChanges(params.oldValue, params.newValue);
        }

        // Get IP and User Agent from request
        const ipAddress = params.req?.headers.get('x-forwarded-for') ||
            params.req?.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = params.req?.headers.get('user-agent') || 'unknown';

        await createAuditLog({
            ...params,
            userId: (session.user as any).id || 'unknown',
            userName: session.user.name || 'Unknown User',
            userEmail: session.user.email || '',
            changes,
            ipAddress,
            userAgent
        });
    } catch (error) {
        // Never throw errors from audit logging - it should not break the main operation
        console.error('Audit logging failed:', error);
    }
}

async function createAuditLog(params: {
    entityType: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    userId: string;
    userName: string;
    userEmail: string;
    oldValue?: any;
    newValue?: any;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
    description?: string;
}) {
    await db.auditLog.create({
        data: {
            entityType: params.entityType,
            entityId: params.entityId,
            action: params.action,
            userId: params.userId,
            userName: params.userName,
            userEmail: params.userEmail,
            oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
            newValue: params.newValue ? JSON.stringify(params.newValue) : null,
            changes: params.changes ? JSON.stringify(params.changes) : null,
            ipAddress: params.ipAddress || 'unknown',
            userAgent: params.userAgent || 'unknown',
            description: params.description || generateDescription(params)
        }
    });
}

/**
 * Calculate the differences between old and new values
 * Returns an object with field-level changes
 */
function calculateChanges(oldValue: any, newValue: any): any {
    const changes: any = {};

    // Get all keys from both objects
    const allKeys = new Set([
        ...Object.keys(oldValue || {}),
        ...Object.keys(newValue || {})
    ]);

    for (const key of allKeys) {
        // Skip internal fields
        if (key === 'updatedAt' || key === 'createdAt') continue;

        const oldVal = oldValue?.[key];
        const newVal = newValue?.[key];

        // Check if values are different
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
            changes[key] = {
                before: oldVal,
                after: newVal
            };
        }
    }

    return Object.keys(changes).length > 0 ? changes : null;
}

/**
 * Generate a human-readable description of the action
 */
function generateDescription(params: {
    action: string;
    entityType: string;
    entityId: string;
    userName: string;
    newValue?: any;
    oldValue?: any;
}): string {
    const { action, entityType, entityId, userName, newValue, oldValue } = params;

    let description = `${userName} ${action.toLowerCase()}d ${entityType}`;

    // Add entity name if available
    const entityName = newValue?.name || oldValue?.name || newValue?.voucherNumber || oldValue?.voucherNumber;
    if (entityName) {
        description += ` "${entityName}"`;
    } else {
        description += ` (ID: ${entityId})`;
    }

    return description;
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(filters: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
}) {
    const where: any = {};

    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;

    if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) where.timestamp.gte = filters.startDate;
        if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const logs = await db.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: filters.limit || 100
    });

    // Parse JSON strings back to objects
    return logs.map(log => ({
        ...log,
        oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
        newValue: log.newValue ? JSON.parse(log.newValue) : null,
        changes: log.changes ? JSON.parse(log.changes) : null
    }));
}

/**
 * Get audit trail for a specific entity
 */
export async function getEntityAuditTrail(entityType: string, entityId: string) {
    return getAuditLogs({ entityType, entityId });
}

/**
 * Export audit logs to CSV
 */
export function exportAuditLogsToCSV(logs: any[]): string {
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Description', 'IP Address'];
    const rows = logs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.userName,
        log.action,
        log.entityType,
        log.entityId,
        log.description,
        log.ipAddress
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}

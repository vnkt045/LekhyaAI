import { db } from '@/lib/db';

interface LoginActivityData {
    userId: string;
    companyId: string | null;
    ipAddress: string;
    userAgent: string;
}

export async function trackLoginActivity(data: LoginActivityData) {
    try {
        await db.loginActivity.create({
            data: {
                userId: data.userId,
                companyId: data.companyId,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent
            }
        });
    } catch (error) {
        console.error('Failed to track login activity:', error);
        // Don't throw - login should succeed even if activity tracking fails
    }
}

export async function validateLicense(companyId: string | null): Promise<{ valid: boolean; message?: string }> {
    if (!companyId) {
        return { valid: true }; // No company = super admin or portal user
    }

    try {
        const company = await db.company.findUnique({
            where: { id: companyId },
            include: { licenseKey: true }
        });

        if (!company) {
            return { valid: false, message: 'Company not found' };
        }

        const license = company.licenseKey;

        if (!license) {
            return { valid: false, message: 'No license key assigned to this company' };
        }

        // Check if license is disabled
        if (license.status === 'DISABLED') {
            return { valid: false, message: 'License has been disabled. Please contact support.' };
        }

        // Check if license is expired
        if (license.status === 'EXPIRED' || (license.expiryDate && new Date(license.expiryDate) < new Date())) {
            return { valid: false, message: 'License has expired. Please renew your subscription.' };
        }

        // Warn if payment is overdue (but allow login)
        if (license.paymentStatus === 'OVERDUE') {
            return { valid: true, message: 'Warning: Payment is overdue. Please update payment details.' };
        }

        return { valid: true };
    } catch (error) {
        console.error('Failed to validate license:', error);
        return { valid: true }; // Allow login on validation error
    }
}

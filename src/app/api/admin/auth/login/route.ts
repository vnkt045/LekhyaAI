import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/auth/login
 * Admin login endpoint (separate from main app auth)
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        // Find admin user
        const adminUser = await db.adminUser.findUnique({
            where: { username },
        });

        if (!adminUser) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check if active
        if (!adminUser.isActive) {
            return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, adminUser.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Update last login
        await db.adminUser.update({
            where: { id: adminUser.id },
            data: { lastLogin: new Date() },
        });

        // Set admin session cookie
        const cookieStore = await cookies();
        cookieStore.set('admin_session', adminUser.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 8, // 8 hours
            path: '/admin',
        });

        return NextResponse.json({
            success: true,
            user: {
                id: adminUser.id,
                username: adminUser.username,
                email: adminUser.email,
                role: adminUser.role,
            },
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}

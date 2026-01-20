import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/auth/logout
 * Admin logout endpoint
 */
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('admin_session');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin logout error:', error);
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}

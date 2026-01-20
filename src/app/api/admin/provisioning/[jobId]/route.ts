import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/admin/provisioning/[jobId]
 * Get provisioning job status and progress
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ jobId: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { jobId } = await params;
        const job = await db.provisioningJob.findUnique({
            where: { id: jobId },
            include: {
                tenant: true,
            },
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Parse steps from JSON string
        const steps = job.steps ? JSON.parse(job.steps) : [];

        return NextResponse.json({
            ...job,
            steps,
        });
    } catch (error) {
        console.error('Failed to fetch provisioning job:', error);
        return NextResponse.json({ error: 'Failed to fetch job status' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET: List all cheque books (optionally filtered by accountId)
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    const where: any = {};
    if (accountId) where.accountId = accountId;

    try {
        const books = await (db as any).chequeBook.findMany({
            where,
            include: {
                account: {
                    select: { name: true }
                },
                _count: {
                    select: { leaves: true } // Just count, or status breakdown?
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(books);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch cheque books' }, { status: 500 });
    }
}

// POST: Create a new Cheque Book
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { accountId, name, fromNumber, numberOfLeaves } = body;

        if (!accountId || !fromNumber || !numberOfLeaves) {
            return NextResponse.json({ error: 'Missing defined fields' }, { status: 400 });
        }

        const start = parseInt(fromNumber);
        const count = parseInt(numberOfLeaves);
        const end = start + count - 1;

        // Transaction to create Book AND Leaves
        const book = await db.$transaction(async (tx) => {
            const newBook = await (tx as any).chequeBook.create({
                data: {
                    accountId,
                    name: name || `Book ${start} - ${end}`,
                    fromNumber: start,
                    toNumber: end,
                    numberOfLeaves: count
                }
            });

            // Generate leaves
            const leavesData = [];
            for (let i = 0; i < count; i++) {
                const num = (start + i).toString().padStart(6, '0'); // Pad with zeros? Usually 6 digits.
                leavesData.push({
                    bookId: newBook.id,
                    chequeNumber: num,
                    status: 'AVAILABLE'
                });
            }

            // Bulk create leaves (Prisma createMany is supported in SQLite now I think, or loop)
            // createMany is supported in recent Prisma versions even for SQLite? 
            // Prisma 5 supports it.
            await (tx as any).chequeLeaf.createMany({
                data: leavesData
            });

            return newBook;
        });

        return NextResponse.json(book);

    } catch (error) {
        console.error('Create Cheque Book Error:', error);
        return NextResponse.json({ error: 'Failed to create cheque book' }, { status: 500 });
    }
}

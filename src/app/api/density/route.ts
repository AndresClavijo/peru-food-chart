export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
    try {
        const rows = await prisma.vote.groupBy({
            by: ['dishId', 'x', 'y'],
            _count: { _all: true },
        });

        const result = rows.map((r) => ({
            dishId: r.dishId,
            x: r.x,
            y: r.y,
            count: r._count._all,
        }));

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error en /api/density:', error);
        return NextResponse.json(
            { ok: false, error: String(error?.message ?? error) },
            { status: 500 }
        );
    }
}


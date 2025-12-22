// src/app/api/votes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// MUY IMPORTANTE: Prisma necesita runtime Node.js
export const runtime = 'nodejs';

type VoteInput = {
  dishId: number;
  x: number;
  y: number;
  userId?: string | null;
};

export async function GET() {
  // Solo para comprobar rápido que la ruta existe
  return NextResponse.json(
    { ok: true, message: 'GET /api/votes está vivo (Prisma ON)' },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch((err) => {
      console.error('Error parseando JSON en /api/votes:', err);
      return null;
    })) as { votes?: VoteInput[] } | null;

    if (!body || !body.votes || !Array.isArray(body.votes) || body.votes.length === 0) {
      console.error('Cuerpo inválido en /api/votes:', body);
      return NextResponse.json(
        { error: 'No se recibieron votos válidos.' },
        { status: 400 },
      );
    }

    const votes = body.votes;
    console.log('Votos recibidos en /api/votes:', votes);

    await prisma.vote.createMany({
      data: votes.map((v) => ({
        dishId: v.dishId,
        x: v.x,
        y: v.y,
        userId: v.userId ?? null,
      })),
    });

    console.log(`Se guardaron ${votes.length} votos`);

    return NextResponse.json({ ok: true, count: votes.length }, { status: 200 });
  } catch (error) {
    console.error('Error en handler POST /api/votes:', error);
    return NextResponse.json(
      { error: 'Error guardando los votos.' },
      { status: 500 },
    );
  }
}





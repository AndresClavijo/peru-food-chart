// src/app/api/votes/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

type VoteInput = {
  dishId: number;
  x: number;
  y: number;
  userId?: string | null;
};

export async function POST(request: Request) {
  try {
    // Intentamos leer el JSON
    const body = (await request.json().catch((err) => {
      console.error('Error parseando JSON en /api/votes:', err);
      return null;
    })) as { votes?: VoteInput[] } | null;

    if (!body || !Array.isArray(body.votes) || body.votes.length === 0) {
      console.error('Cuerpo inválido en /api/votes:', body);
      return NextResponse.json(
        { ok: false, error: 'No se recibieron votos válidos.', body },
        { status: 400 },
      );
    }

    const votes = body.votes;

    console.log('Votos recibidos en /api/votes:', votes);

    // Opcional: validación básica
    const data = votes.map((v) => ({
      dishId: v.dishId,
      x: v.x,
      y: v.y,
      userId: v.userId ?? null,
    }));

    const result = await prisma.vote.createMany({
      data,
    });

    console.log(`Se guardaron ${result.count} votos`);

    return NextResponse.json(
      { ok: true, count: result.count },
      { status: 200 },
    );
  } catch (error: any) {
    // 👇 Aquí capturamos el error real de Prisma (código, meta, etc.)
    console.error('Error en handler POST /api/votes:', error);

    return NextResponse.json(
      {
        ok: false,
        error: String(error?.message ?? error),
        code: error?.code ?? null,
        meta: error?.meta ?? null,
      },
      { status: 500 },
    );
  }
}






// src/app/api/averages/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  // Promedios de x,y y conteo por plato
  const aggregates = await prisma.vote.groupBy({
    by: ['dishId'],
    _avg: {
      x: true,
      y: true,
    },
    _count: {
      _all: true,
    },
  });

  const dishes = await prisma.dish.findMany();

  const result = dishes.map((dish) => {
    const agg = aggregates.find((a) => a.dishId === dish.id);

    return {
      dishId: dish.id,
      name: dish.name,
      imageUrl: dish.imageUrl,
      avgX: agg?._avg.x ?? null,
      avgY: agg?._avg.y ?? null,
      count: agg?._count._all ?? 0,
    };
  });

  return NextResponse.json(result);
}

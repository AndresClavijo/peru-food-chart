// src/app/api/dev/seed-dishes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

const DISH_DEFS = [
  {
    slug: 'ceviche',
    name: 'Ceviche',
    imageUrl: '/ceviche.png',
  },
  {
    slug: 'lomo-saltado',
    name: 'Lomo Saltado',
    imageUrl: '/lomo-saltado.png',
  },
  {
    slug: 'aji-de-gallina',
    name: 'Ají de Gallina',
    imageUrl: '/aji-de-gallina.png',
  },
  {
    slug: 'pollo-a-la-brasa',
    name: 'Pollo a la Brasa',
    imageUrl: '/pollo-a-la-brasa.png',
  },
  {
    slug: 'causa-limena',
    name: 'Causa Limeña',
    imageUrl: '/causa-limena.png',
  },
  {
    slug: 'arroz-con-pollo',
    name: 'Arroz con Pollo',
    imageUrl: '/arroz-con-pollo.png',
  },
  {
    slug: 'tacu-tacu',
    name: 'Tacu Tacu',
    imageUrl: '/tacu-tacu.png',
  },
  {
    slug: 'parihuela',
    name: 'Parihuela',
    imageUrl: '/parihuela.png',
  },
  {
    slug: 'anticuchos',
    name: 'Anticuchos',
    imageUrl: '/anticuchos.png',
  },
  {
    slug: 'juane',
    name: 'Juane',
    imageUrl: '/juane.png',
  },
  {
    slug: 'tacacho-con-cecina',
    name: 'Tacacho con Cecina',
    imageUrl: '/tacacho-con-cecina.png',
  },
  {
    slug: 'cuy-chactado',
    name: 'Cuy Chactado',
    imageUrl: '/cuy-chactado.png',
  },
  {
    slug: 'pachamanca',
    name: 'Pachamanca',
    imageUrl: '/pachamanca.png',
  },
];

export async function GET() {
  // Para cada plato, hacemos upsert por slug (si existe, lo actualiza; si no, lo crea)
  for (const d of DISH_DEFS) {
    await prisma.dish.upsert({
      where: { slug: d.slug },
      update: {
        name: d.name,
        imageUrl: d.imageUrl,
      },
      create: {
        name: d.name,
        slug: d.slug,
        imageUrl: d.imageUrl,
      },
    });
  }

  const dishes = await prisma.dish.findMany({
    orderBy: { id: 'asc' },
  });

  return NextResponse.json({
    ok: true,
    message: 'Platos asegurados (upsert)',
    count: dishes.length,
    dishes,
  });
}


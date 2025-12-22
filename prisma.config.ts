// prisma.config.ts (en la raíz del proyecto)
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  // ruta a tu schema
  schema: 'prisma/schema.prisma',

  // opcional pero recomendado: carpeta donde guardar migraciones
  migrations: {
    path: 'prisma/migrations',
  },

  // 👇 ESTA es la clave: propiedad *datasource* (singular)
  datasource: {
    url: env('DATABASE_URL'),
  },
});



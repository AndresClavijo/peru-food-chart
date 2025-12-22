'use client';

import { useState } from 'react';
import ChartBoard from '../../components/ChartBoard';
import DraggableDish from '../../components/DraggableDish';

type Dish = {
  id: number;
  name: string;
  imageUrl?: string;
};

type AverageItem = {
  dishId: number;
  name: string;
  imageUrl?: string | null;
  avgX: number | null;
  avgY: number | null;
  count: number;
};

type Position = { x: number; y: number };

// Lista de platos con nombres e imágenes (pon las imágenes en /public)
const DISHES: Dish[] = [
  { id: 1, name: 'Ceviche', imageUrl: '/ceviche.png' },
  { id: 2, name: 'Lomo Saltado', imageUrl: '/lomo-saltado.png' },
  { id: 3, name: 'Ají de Gallina', imageUrl: '/aji-de-gallina.png' },
  { id: 4, name: 'Pollo a la Brasa', imageUrl: '/pollo-a-la-brasa.png' },
  { id: 5, name: 'Causa Limeña', imageUrl: '/causa-limena.png' },
  { id: 6, name: 'Arroz con Pollo', imageUrl: '/arroz-con-pollo.png' },
  { id: 7, name: 'Tacu Tacu', imageUrl: '/tacu-tacu.png' },
  { id: 8, name: 'Parihuela', imageUrl: '/parihuela.png' },
  { id: 9, name: 'Anticuchos', imageUrl: '/anticuchos.png' },
  { id: 10, name: 'Juane', imageUrl: '/juane.png' },
  { id: 11, name: 'Tacacho con Cecina', imageUrl: '/tacacho-con-cecina.png' },
  { id: 12, name: 'Cuy Chactado', imageUrl: '/cuy-chactado.png' },
  { id: 13, name: 'Pachamanca', imageUrl: '/pachamanca.png' },
];

// Marcador de resultados (plano de “vista”)
function ResultDishMarker({
  name,
  imageUrl,
  x,
  y,
}: {
  name: string;
  imageUrl?: string | null;
  x: number;
  y: number;
}) {
  // x,y están en [0,1], los mapeamos a % dentro del plano
  const left = `${x * 100}%`;
  const top = `${(1 - y) * 100}%`; // y=1 arriba, y=0 abajo

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        transform: 'translate(-50%, -50%)',
        width: 48,
        height: 48,
        borderRadius: '50%',
        overflow: 'hidden',
        background: '#fff',
        border: '1px solid #999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 9,
        textAlign: 'center',
        padding: 4,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}
      title={name}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span>{name}</span>
      )}
    </div>
  );
}

export default function VotarPage() {
  // Votos del usuario en esta sesión (coordenadas normalizadas)
  const [votes, setVotes] = useState<Record<number, Position>>({});
  const [submitting, setSubmitting] = useState(false);

  // Vista de resultados: 'user' = mis votos, 'average' = promedio
  const [viewMode, setViewMode] = useState<'user' | 'average'>('user');
  const [averages, setAverages] = useState<Record<number, { x: number; y: number; count: number }>>(
    {},
  );
  const [averagesLoaded, setAveragesLoaded] = useState(false);

  function handleChange(id: number, x: number, y: number) {
    setVotes((prev) => ({ ...prev, [id]: { x, y } }));
  }

  async function handleSubmit() {
  const payload = {
    votes: Object.entries(votes).map(([dishId, coord]) => ({
      dishId: Number(dishId),
      x: coord.x,
      y: coord.y,
    })),
  };

  if (payload.votes.length === 0) {
    alert('Arrastra al menos un plato al plano antes de enviar.');
    return;
  }

  setSubmitting(true);
  try {
    const res = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text(); // 👈 leemos texto crudo
    console.log('Respuesta cruda /api/votes:', res.status, text);

    if (!res.ok) {
      alert('Hubo un error al guardar tus votos. Código: ' + res.status);
      return;
    }

    // si quieres, intentar parsear JSON
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.warn('La respuesta no es JSON válido, pero el status es OK.');
    }

    console.log('Respuesta parseada /api/votes:', data);
    alert('¡Gracias! Tus votos fueron recibidos por el servidor (test).');
  } catch (err) {
    console.error('Error en fetch /api/votes:', err);
    alert('Error de conexión con el servidor.');
  } finally {
    setSubmitting(false);
  }
}


  async function handleShowUserView() {
    setViewMode('user');
  }

async function handleShowAverageView() {
  setViewMode('average');

  try {
    const res = await fetch('/api/averages');
    if (!res.ok) {
      console.error('Error al obtener promedios');
      return;
    }

    const data = (await res.json()) as AverageItem[];
    console.log('Promedios recibidos:', data); // 👈 para ver qué llega

    const map: Record<number, { x: number; y: number; count: number }> = {};
    data.forEach((item) => {
      if (item.avgX !== null && item.avgY !== null) {
        map[item.dishId] = {
          x: item.avgX,
          y: item.avgY,
          count: item.count,
        };
      }
    });

    console.log('Mapa de promedios:', map); // 👈 para ver qué se va a pintar

    setAverages(map);
    setAveragesLoaded(true);
  } catch (err) {
    console.error('Error en fetch /api/averages', err);
  }
}


  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem 1rem',
      }}
    >
      <section style={{ textAlign: 'center', maxWidth: 700 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          Evaluar platos de comida peruana
        </h1>
        <p style={{ marginTop: '0.5rem' }}>
          Arrastra cada plato desde la bandeja inferior hacia el plano según qué tan{' '}
          <b>barato o caro</b> y qué tan <b>rico o no tan rico</b> te parece.
        </p>
      </section>

      {/* Área de drag: plano arriba + bandeja de platos abajo */}
      <section>
        <div
          id="drag-area"
          style={{
            position: 'relative',
            width: 500,
            height: 650, // 500 del plano + ~150 para la bandeja
          }}
        >
          {/* Plano cartesiano para arrastrar */}
          <ChartBoard />

          {/* Platos en bandeja (debajo del plano) */}
          {DISHES.map((dish, idx) => {
            const columns = 4;
            const col = idx % columns;
            const row = Math.floor(idx / columns);

            const initialX = (col + 0.5) / columns; // 0..1
            const initialY = row; // 0,1,2,...

            return (
              <DraggableDish
                key={dish.id}
                id={dish.id}
                name={dish.name}
                imageUrl={dish.imageUrl}
                initialX={initialX}
                initialY={initialY}
                onChange={handleChange}
              />
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: 999,
              border: '1px solid #333',
              background: submitting ? '#eee' : '#fff',
              cursor: submitting ? 'default' : 'pointer',
            }}
          >
            {submitting ? 'Enviando...' : 'Enviar mis opiniones'}
          </button>
        </div>
      </section>

      {/* Plano de resultados con los dos modos */}
      <section style={{ width: 500 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center' }}>
          Resultados en el plano cartesiano
        </h2>

        <div style={{ marginTop: '1rem', position: 'relative' }}>
          <ChartBoard>
            {/* Vista "Mis votos": usamos las coordenadas que el usuario definió */}
            {viewMode === 'user' &&
              DISHES.map((dish) => {
                const pos = votes[dish.id];
                if (!pos) return null; // si no lo arrastró, no lo mostramos
                return (
                  <ResultDishMarker
                    key={`user-${dish.id}`}
                    name={dish.name}
                    imageUrl={dish.imageUrl}
                    x={pos.x}
                    y={pos.y}
                  />
                );
              })}

            {/* Vista "Promedio gente": usamos las coordenadas promedio de la BD */}
            {viewMode === 'average' &&
              DISHES.map((dish) => {
                const avg = averages[dish.id];
                if (!avg || avg.count === 0) return null;
                return (
                  <ResultDishMarker
                    key={`avg-${dish.id}`}
                    name={dish.name}
                    imageUrl={dish.imageUrl}
                    x={avg.x}
                    y={avg.y}
                  />
                );
              })}
              {viewMode === 'average' &&
                Object.keys(averages).length === 0 && (
                    <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        fontSize: 14,
                        color: '#666',
                        textAlign: 'center',
                        padding: '0 1rem',
                    }}
                    >
                    Aún no hay suficientes votos para mostrar el promedio.
                    <br />
                    Pide a más personas que envíen sus opiniones.
                    </div>
                )}
          </ChartBoard>
        </div>

        {/* Botones DEBAJO del plano de resultados */}
        <div
          style={{
            marginTop: '0.75rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={handleShowUserView}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 999,
              border: '1px solid #333',
              background: viewMode === 'user' ? '#333' : '#fff',
              color: viewMode === 'user' ? '#fff' : '#000',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Ver cómo acomodé los platos
          </button>

          <button
            onClick={handleShowAverageView}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 999,
              border: '1px solid #333',
              background: viewMode === 'average' ? '#333' : '#fff',
              color: viewMode === 'average' ? '#fff' : '#000',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Ver votación promedio de la gente
          </button>
        </div>
      </section>
    </main>
  );
}






'use client';

import { useState } from 'react';
import ChartBoard from '../../components/ChartBoard';
import DraggableDish from '../../components/DraggableDish';
import DensityChart from '../../components/DensityChart';

type Dish = {
  id: number;
  name: string;
  imageUrl?: string;
  description: string;
};

type VotePos = { x: number; y: number };

type RawAverage = {
  dishId: number;
  name?: string;
  imageUrl?: string | null;
  avgX: number;
  avgY: number;
  count: number;
};

type AverageMapItem = {
  x: number;
  y: number;
  count: number;
};

type DensityRow = {
  dishId: number;
  x: number;
  y: number;
  count: number;
};

type DensityPoint = { x: number; y: number; count: number };

type Plane2View = 'average' | 'user';

const BOARD_SIZE = 500; // solo para algunos textos; el layout viene de CSS

const DISHES: Dish[] = [
  {
    id: 1,
    name: 'Ceviche',
    imageUrl: '/ceviche.png',
    description: 'Pescado fresco marinado en limón, clásico de la costa peruana.',
  },
  {
    id: 2,
    name: 'Lomo Saltado',
    imageUrl: '/lomo-saltado.png',
    description: 'Salteado de carne, cebolla y tomate con papas fritas y arroz.',
  },
  {
    id: 3,
    name: 'Ají de Gallina',
    imageUrl: '/aji-de-gallina.png',
    description: 'Pollo deshilachado en crema de ají amarillo, suave y cremoso.',
  },
  {
    id: 4,
    name: 'Pollo a la Brasa',
    imageUrl: '/pollo-a-la-brasa.png',
    description: 'Pollo asado con sazón especial, uno de los platos más populares.',
  },
  {
    id: 5,
    name: 'Causa Limeña',
    imageUrl: '/causa-limena.png',
    description: 'Capas de puré de papa amarilla rellenas de pollo o atún.',
  },
  {
    id: 6,
    name: 'Arroz con Pollo',
    imageUrl: '/arroz-con-pollo.png',
    description: 'Arroz verde y jugoso con pollo y verduras.',
  },
  {
    id: 7,
    name: 'Tacu Tacu',
    imageUrl: '/tacu-tacu.png',
    description: 'Torta de arroz y frejoles dorada a la plancha.',
  },
  {
    id: 8,
    name: 'Parihuela',
    imageUrl: '/parihuela.png',
    description: 'Caldo contundente de mariscos y pescado.',
  },
  {
    id: 9,
    name: 'Anticuchos',
    imageUrl: '/anticuchos.png',
    description: 'Brochetas marinadas a la parrilla, típicas de la calle.',
  },
  {
    id: 10,
    name: 'Juane',
    imageUrl: '/juane.png',
    description: 'Arroz y pollo envueltos en hoja de bijao, típico de la selva.',
  },
  {
    id: 11,
    name: 'Tacacho con Cecina',
    imageUrl: '/tacacho-con-cecina.png',
    description:
      'Plátano asado y machacado con chicharrón, acompañado de cecina.',
  },
  {
    id: 12,
    name: 'Cuy Chactado',
    imageUrl: '/cuy-chactado.png',
    description: 'Cuy frito crocante, plato emblemático andino.',
  },
  {
    id: 13,
    name: 'Pachamanca',
    imageUrl: '/pachamanca.png',
    description: 'Carnes y tubérculos cocidos bajo tierra con piedras calientes.',
  },
];

// Marcador del plano 2: solo círculo + tooltip al pasar el mouse
function ResultDishMarker({
  name,
  imageUrl,
  x,
  y,
}: {
  name: string;
  imageUrl?: string;
  x: number;
  y: number;
}) {
  const [hover, setHover] = useState(false);

  const left = x * 100;
  const top = (1 - y) * 100;

  return (
    <div
      title={name}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        transform: 'translate(-50%, -50%)',
        width: 32,
        height: 32,
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid #16a34a',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}
      </div>

      {hover && (
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.85)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 999,
            fontSize: 11,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {name}
        </div>
      )}
    </div>
  );
}

export default function VotarPage() {
  const [votes, setVotes] = useState<Record<number, VotePos>>({});
  const [averages, setAverages] = useState<Record<number, AverageMapItem>>({});
  const [density, setDensity] = useState<Record<number, DensityPoint[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [plane2View, setPlane2View] = useState<Plane2View>('average');

  const placedCount = Object.keys(votes).length;
  const remaining = DISHES.length - placedCount;

  function handleChange(id: number, x: number, y: number) {
    setVotes((prev) => ({
      ...prev,
      [id]: { x, y },
    }));
  }

  async function fetchAverages() {
    try {
      setLoadingResults(true);
      const res = await fetch('/api/averages');
      if (!res.ok) {
        console.error('Error al cargar promedios:', res.status);
        return;
      }
      const data: RawAverage[] = await res.json();
      const map: Record<number, AverageMapItem> = {};
      for (const item of data) {
        map[item.dishId] = {
          x: item.avgX,
          y: item.avgY,
          count: item.count,
        };
      }
      setAverages(map);
    } catch (error) {
      console.error('Error fetch /api/averages:', error);
    } finally {
      setLoadingResults(false);
    }
  }

  async function fetchDensity() {
    try {
      const res = await fetch('/api/density');
      if (!res.ok) {
        console.error('Error al cargar densidad:', res.status);
        return;
      }
      const data: DensityRow[] = await res.json();
      const map: Record<number, DensityPoint[]> = {};
      for (const row of data) {
        if (!map[row.dishId]) map[row.dishId] = [];
        map[row.dishId].push({ x: row.x, y: row.y, count: row.count });
      }
      setDensity(map);
    } catch (error) {
      console.error('Error fetch /api/density:', error);
    }
  }

  async function handleSeeOthers() {
    if (placedCount === 0) {
      alert('Primero arrastra al menos un plato al plano antes de continuar.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        votes: Object.entries(votes).map(([dishId, pos]) => ({
          dishId: Number(dishId),
          x: pos.x,
          y: pos.y,
        })),
      };

      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log('Respuesta /api/votes:', res.status, text);

      if (!res.ok) {
        alert('Hubo un error al guardar tus votos. Código: ' + res.status);
        return;
      }

      await Promise.all([fetchAverages(), fetchDensity()]);
      setPlane2View('average');
      setHasSubmitted(true);
    } catch (error) {
      console.error('Error enviando votos:', error);
      alert('Ocurrió un error al enviar tus opiniones.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-main">
      <section className="page-section-text">
        <h1 style={{ fontSize: '2.4rem', fontWeight: 'bold' }}>
          Evaluar platos de comida peruana
        </h1>
        <p style={{ marginTop: '0.5rem', fontSize: 15 }}>
          Arrastra cada plato desde la fila superior hacia el plano según qué tan{' '}
          <b>barato o caro</b> y qué tan <b>rico o no tan rico</b> te parece.
        </p>
      </section>

      {/* Plano 1: votar */}
      {!hasSubmitted && (
        <section>
          <div className="votar-layout">
            {/* Plano + fila de platos */}
            <div className="drag-area-wrapper">
              <div id="drag-area" className="drag-area-inner">
                {/* Plano cartesiano desplazado hacia abajo */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 110, // PALETTE_HEIGHT
                  }}
                >
                  <ChartBoard />
                </div>

                {/* Platos en bandeja (2 filas: 7 arriba, 6 abajo) */}
                {DISHES.map((dish, idx) => {
                  const FIRST_ROW_COUNT = 7;
                  const isFirstRow = idx < FIRST_ROW_COUNT;

                  const row = isFirstRow ? 0 : 1;
                  const col = isFirstRow ? idx : idx - FIRST_ROW_COUNT;
                  const colsInRow = isFirstRow
                    ? FIRST_ROW_COUNT
                    : DISHES.length - FIRST_ROW_COUNT; // 6 en la segunda fila

                  // Distribuimos cada fila a lo ancho de la bandeja (0..1)
                  const initialX = (col + 0.5) / colsInRow;
                  const initialY = row; // 0 = fila de arriba, 1 = fila de abajo

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
            </div>

            {/* Progreso + botón verde */}
            <div className="progress-sidebar">
              <h3
                style={{
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  fontSize: 18,
                }}
              >
                Progreso
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                Te faltan{' '}
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 'bold',
                  }}
                >
                  {remaining}
                </span>{' '}
                plato{remaining === 1 ? '' : 's'} por colocar
              </p>

              {placedCount > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <p
                    style={{
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                    }}
                  >
                    ¿Listo?
                  </p>
                  <button
                    onClick={handleSeeOthers}
                    disabled={submitting}
                    style={{
                      padding: '0.6rem 1.6rem',
                      borderRadius: 999,
                      border: 'none',
                      background: '#22c55e',
                      color: '#fff',
                      cursor: submitting ? 'default' : 'pointer',
                      fontSize: 15,
                      fontWeight: 600,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    }}
                  >
                    {submitting ? 'Enviando...' : 'Ver cómo votaron los demás'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Plano 2: resultados */}
      {hasSubmitted && (
        <section className="results-section">
          <h2
            style={{
              fontSize: '1.6rem',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            Resultados en el plano cartesiano
          </h2>

          <p
            style={{
              textAlign: 'center',
              marginTop: '0.25rem',
              fontSize: 14,
              color: '#555',
            }}
          >
            Cada círculo muestra la posición de los platos. Pasa el mouse por
            encima para ver el nombre.
          </p>

          <div className="results-board-wrapper">
            <div className="results-board-inner">
              <ChartBoard />

              {/* Vistas con fade */}
              <div style={{ position: 'absolute', inset: 0 }}>
                {/* Promedio */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: plane2View === 'average' ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents:
                      plane2View === 'average' ? 'auto' : 'none',
                  }}
                >
                  {Object.keys(averages).length === 0 && !loadingResults && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        color: '#666',
                        textAlign: 'center',
                        padding: '0 1rem',
                      }}
                    >
                      Aún no hay suficientes votos para mostrar el promedio.
                    </div>
                  )}

                  {DISHES.map((dish) => {
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
                </div>

                {/* Mis votos */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: plane2View === 'user' ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: plane2View === 'user' ? 'auto' : 'none',
                  }}
                >
                  {Object.keys(votes).length === 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        color: '#666',
                        textAlign: 'center',
                        padding: '0 1rem',
                      }}
                    >
                      No registramos votos tuyos en el plano.
                    </div>
                  )}

                  {DISHES.map((dish) => {
                    const pos = votes[dish.id];
                    if (!pos) return null;
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
                </div>
              </div>
            </div>
          </div>

          {/* Botones de vista debajo del plano 2 */}
          <div
            style={{
              marginTop: '0.9rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
          >
            <button
              onClick={() => setPlane2View('user')}
              style={{
                padding: '0.45rem 1.2rem',
                borderRadius: 999,
                border: '1px solid #333',
                background: plane2View === 'user' ? '#333' : '#fff',
                color: plane2View === 'user' ? '#fff' : '#000',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Ver cómo acomodé los platos
            </button>

            <button
              onClick={() => setPlane2View('average')}
              style={{
                padding: '0.45rem 1.2rem',
                borderRadius: 999,
                border: '1px solid #333',
                background: plane2View === 'average' ? '#333' : '#fff',
                color: plane2View === 'average' ? '#fff' : '#000',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Ver votación promedio de la gente
            </button>
          </div>

          {/* Tarjetas por plato con densidad */}
          <section style={{ marginTop: '2rem' }}>
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem',
              }}
            >
              Resultados por plato
            </h3>

            <div className="dish-cards-grid">
              {DISHES.map((dish) => {
                const points = density[dish.id] ?? [];
                const avg = averages[dish.id];
                const myVote = votes[dish.id];

                if (!avg && !myVote && points.length === 0) return null;

                return (
                  <article
                    key={`card-${dish.id}`}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'stretch',
                      background: '#fff',
                      borderRadius: 16,
                      padding: '0.75rem 0.9rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    }}
                  >
                    {/* izquierda: imagen + texto */}
                    <div
                      style={{
                        flex: '0 0 140px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        gap: 6,
                      }}
                    >
                      {dish.imageUrl && (
                        <img
                          src={dish.imageUrl}
                          alt={dish.name}
                          style={{
                            width: 96,
                            height: 96,
                            objectFit: 'cover',
                            borderRadius: '50%',
                          }}
                        />
                      )}
                      <div
                        style={{
                          fontWeight: 'bold',
                          fontSize: 15,
                        }}
                      >
                        {dish.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#555',
                        }}
                      >
                        {dish.description}
                      </div>
                    </div>

                    {/* derecha: mini-gráfica de densidad */}
                    <div
                      style={{
                        flex: '1 1 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <DensityChart
                        points={points}
                        average={avg ? { x: avg.x, y: avg.y } : null}
                        userVote={myVote ? { x: myVote.x, y: myVote.y } : null}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      )}
    </main>
  );
}

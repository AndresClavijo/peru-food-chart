// src/components/ChartBoard.tsx

// src/components/ChartBoard.tsx

type ChartBoardProps = {
  /** Tamaño del plano en píxeles (por defecto 500). */
  size?: number;
};

const GRID_STEPS = 6; // 6 x 6 → 36 cuadrantes

export default function ChartBoard({ size = 500 }: ChartBoardProps) {
  const BOARD_SIZE = size;

  // Posiciones (en %) de las líneas internas (5 líneas para 6 divisiones)
  const positions = Array.from(
    { length: GRID_STEPS - 1 },
    (_, i) => ((i + 1) / GRID_STEPS) * 100,
  );

  return (
    <div
      id="chart-board"
      style={{
        position: 'relative',
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        maxWidth: '100%',
        borderRadius: 12,
        border: '1px solid #d1d5db',
        background: '#f9fafb',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        margin: '0 auto',
      }}
    >
      <svg
        viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      >
        {/* Fondo */}
        <rect
          x={0}
          y={0}
          width={BOARD_SIZE}
          height={BOARD_SIZE}
          fill="#f9fafb"
        />

        {/* Líneas de rejilla suaves (verticales) */}
        {positions.map((p, idx) => {
          const x = (p / 100) * BOARD_SIZE;
          const isCenter = Math.abs(p - 50) < 0.01;

          return (
            <line
              key={`v-${idx}`}
              x1={x}
              y1={0}
              x2={x}
              y2={BOARD_SIZE}
              stroke={isCenter ? '#9ca3af' : '#e5e7eb'}
              strokeWidth={isCenter ? 2 : 1}
              strokeDasharray={isCenter ? 'none' : '4 4'}
            />
          );
        })}

        {/* Líneas de rejilla suaves (horizontales) */}
        {positions.map((p, idx) => {
          const y = (p / 100) * BOARD_SIZE;
          const isCenter = Math.abs(p - 50) < 0.01;

          return (
            <line
              key={`h-${idx}`}
              x1={0}
              y1={y}
              x2={BOARD_SIZE}
              y2={y}
              stroke={isCenter ? '#9ca3af' : '#e5e7eb'}
              strokeWidth={isCenter ? 2 : 1}
              strokeDasharray={isCenter ? 'none' : '4 4'}
            />
          );
        })}

        {/* Marco exterior ligeramente resaltado */}
        <rect
          x={0}
          y={0}
          width={BOARD_SIZE}
          height={BOARD_SIZE}
          fill="none"
          stroke="#9ca3af"
          strokeWidth={1.5}
        />
      </svg>

      {/* Etiquetas de ejes con pequeño fondo que “corta” la línea */}

      {/* Eje vertical: Precio (arriba Caro, abajo Barato) */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#374151',
          backgroundColor: '#f9fafb',
          padding: '2px 10px',
          borderRadius: 999,
          boxShadow: '0 0 3px rgba(0,0,0,0.06)',
        }}
      >
        Caro
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#374151',
          backgroundColor: '#f9fafb',
          padding: '2px 10px',
          borderRadius: 999,
          boxShadow: '0 0 3px rgba(0,0,0,0.06)',
        }}
      >
        Barato
      </div>

      {/* Eje horizontal: Sabor (izq No tan rico, der Muy rico) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 8,
          transform: 'translateY(-50%)',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#374151',
          backgroundColor: '#f9fafb',
          padding: '2px 10px',
          borderRadius: 999,
          boxShadow: '0 0 3px rgba(0,0,0,0.06)',
        }}
      >
        No tan rico
      </div>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: 8,
          transform: 'translateY(-50%)',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#374151',
          backgroundColor: '#f9fafb',
          padding: '2px 10px',
          borderRadius: 999,
          boxShadow: '0 0 3px rgba(0,0,0,0.06)',
        }}
      >
        Muy rico
      </div>
    </div>
  );
}


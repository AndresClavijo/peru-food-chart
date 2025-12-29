// src/components/ChartBoard.tsx

const BOARD_SIZE = 500;
const GRID_STEPS = 6; // 6 x 6 → 36 cuadrantes

export default function ChartBoard() {
  // Posiciones (en %) de las líneas internas (5 líneas para 6 divisiones)
  const positions = Array.from({ length: GRID_STEPS - 1 }, (_, i) => ((i + 1) / GRID_STEPS) * 100);

  return (
    <div
      id="chart-board"
      style={{
        position: 'relative',
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        border: '1px solid #ccc',
        backgroundColor: '#f7f7f7',
      }}
    >
      {/* Líneas verticales (incluye eje central más grueso/oscuro) */}
      {positions.map((p, idx) => {
        const isCenter = idx === Math.floor((GRID_STEPS - 1) / 2); // la tercera de 5 → 50%
        return (
          <div
            key={`v-${idx}`}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${p}%`,
              width: isCenter ? 3 : 1,
              backgroundColor: isCenter ? '#000' : 'rgba(0,0,0,0.15)',
              transform: 'translateX(-50%)',
            }}
          />
        );
      })}

      {/* Líneas horizontales (incluye eje central más grueso/oscuro) */}
      {positions.map((p, idx) => {
        const isCenter = idx === Math.floor((GRID_STEPS - 1) / 2);
        return (
          <div
            key={`h-${idx}`}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${p}%`,
              height: isCenter ? 3 : 1,
              backgroundColor: isCenter ? '#000' : 'rgba(0,0,0,0.15)',
              transform: 'translateY(-50%)',
            }}
          />
        );
      })}

      {/* Etiquetas de los ejes */}

      {/* Arriba: Barato (sobre el eje vertical, cerca del borde superior) */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 18,
          fontWeight: 'bold',
          backgroundColor: '#f7f7f7', // mismo fondo para "cortar" la línea
          padding: '0 8px',
          boxShadow: '0 0 3px rgba(0,0,0,0.05)',
        }}
      >
        Barato
      </div>

      {/* Abajo: Caro (sobre el eje vertical, cerca del borde inferior) */}
      <div
        style={{
          position: 'absolute',
          bottom: 6,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 18,
          fontWeight: 'bold',
          backgroundColor: '#f7f7f7',
          padding: '0 8px',
          boxShadow: '0 0 3px rgba(0,0,0,0.05)',
        }}
      >
        Caro
      </div>

      {/* Izquierda: No tan rico (sobre el eje horizontal, cerca del borde izquierdo) */}
      <div
        style={{
          position: 'absolute',
          left: 6,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 18,
          fontWeight: 'bold',
          backgroundColor: '#f7f7f7',
          padding: '0 8px',
          boxShadow: '0 0 3px rgba(0,0,0,0.05)',
        }}
      >
        No tan rico
      </div>

      {/* Derecha: Rico (sobre el eje horizontal, cerca del borde derecho) */}
      <div
        style={{
          position: 'absolute',
          right: 6,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 18,
          fontWeight: 'bold',
          backgroundColor: '#f7f7f7',
          padding: '0 8px',
          boxShadow: '0 0 3px rgba(0,0,0,0.05)',
        }}
      >
        Rico
      </div>
    </div>
  );
}



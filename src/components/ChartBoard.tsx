'use client';

import type { ReactNode } from 'react';

type ChartBoardProps = {
  children?: ReactNode;
};

export default function ChartBoard({ children }: ChartBoardProps) {
  return (
    <div
      id="chart-board"
      style={{
        position: 'relative',
        width: 500,
        height: 500,
        border: '1px solid #ccc',
        margin: '0 auto',
        userSelect: 'none',
        background: '#fafafa',
      }}
    >
      {/* Líneas de ejes (cuatro cuadrantes) */}
      {/* Eje horizontal */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: '100%',
          height: 1,
          backgroundColor: '#ddd',
          pointerEvents: 'none',
        }}
      />
      {/* Eje vertical */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: 1,
          height: '100%',
          backgroundColor: '#ddd',
          pointerEvents: 'none',
        }}
      />

      {/* Etiqueta eje X */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: -24,
          transform: 'translateX(-50%)',
          fontSize: 12,
        }}
      >
        Barato ← Precio → Muy caro
      </div>

      {/* Etiqueta eje Y */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: -10,
          transform: 'translateY(-50%) rotate(-90deg)',
          transformOrigin: 'left center',
          fontSize: 12,
        }}
      >
        No tan rico ← Sabor → Muy rico
      </div>

      {children}
    </div>
  );
}


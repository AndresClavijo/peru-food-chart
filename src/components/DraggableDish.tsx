'use client';

import { useEffect, useRef, useState } from 'react';

type DraggableDishProps = {
  id: number;
  name: string;
  imageUrl?: string;
  initialX?: number; // 0..1 → posición horizontal en la fila superior
  initialY?: number; // se mantiene por compatibilidad, ya no lo usamos
  onChange?: (id: number, x: number, y: number) => void;
};

const PALETTE_HEIGHT = 110;
const CONTAINER_WIDTH = 34;   // ancho del "slot" del plato en la fila
const CONTAINER_HEIGHT = 80;  // círculo + texto
const CIRCLE_SIZE = 28;       // tamaño del círculo

export default function DraggableDish({
  id,
  name,
  imageUrl,
  initialX = 0.5,
  initialY = 0,
  onChange,
}: DraggableDishProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [posPx, setPosPx] = useState<{ left: number; top: number } | null>(null);

  // Posición inicial en la fila superior (fuera del plano)
  useEffect(() => {
    const dragArea = document.getElementById('drag-area');
    if (!dragArea) return;

    const rectArea = dragArea.getBoundingClientRect();

    const left = initialX * rectArea.width - CONTAINER_WIDTH / 2;
    const top = (PALETTE_HEIGHT - CIRCLE_SIZE) / 2;

    const clampedLeft = Math.max(0, Math.min(rectArea.width - CONTAINER_WIDTH, left));
    const clampedTop = Math.max(0, Math.min(PALETTE_HEIGHT - CIRCLE_SIZE, top));

    setPosPx({ left: clampedLeft, top: clampedTop });
  }, [initialX, initialY]);

  // Drag dentro de drag-area
  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!dragging || !ref.current) return;
      const dragArea = document.getElementById('drag-area');
      if (!dragArea) return;

      const rectArea = dragArea.getBoundingClientRect();

      let left = e.clientX - rectArea.left - CONTAINER_WIDTH / 2;
      let top = e.clientY - rectArea.top - CIRCLE_SIZE / 2;

      left = Math.max(0, Math.min(rectArea.width - CONTAINER_WIDTH, left));
      top = Math.max(0, Math.min(rectArea.height - CIRCLE_SIZE, top));

      setPosPx({ left, top });
    }

    function onPointerUp() {
      if (!dragging || !ref.current) return;
      setDragging(false);

      const board = document.getElementById('chart-board');
      const dragArea = document.getElementById('drag-area');
      if (!board || !dragArea) return;

      const rectBoard = board.getBoundingClientRect();
      const rectDish = ref.current.getBoundingClientRect();

      // Centro del círculo
      const centerX = rectDish.left + rectDish.width / 2;
      const centerY = rectDish.top + CIRCLE_SIZE / 2;

      const relX = centerX - rectBoard.left;
      const relY = centerY - rectBoard.top;

      // Si está fuera del plano, no contamos el voto ni marcamos como colocado
      if (
        relX < 0 ||
        relX > rectBoard.width ||
        relY < 0 ||
        relY > rectBoard.height
      ) {
        return;
      }

      const xNorm = relX / rectBoard.width;      // 0..1 → barato→caro
      const yNorm = 1 - relY / rectBoard.height; // 0..1 → no tan rico→muy rico

      setPlaced(true);           // 👈 detiene el temblor
      onChange?.(id, xNorm, yNorm);
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [dragging, onChange, id]);

  return (
    <div
      ref={ref}
      onPointerDown={() => setDragging(true)}
      style={{
        position: 'absolute',
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
        cursor: dragging ? 'grabbing' : 'grab',
        left: posPx ? posPx.left : 0,
        top: posPx ? posPx.top : 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        textAlign: 'center',
      }}
      title={name}
    >
      {/* Círculo con imagen, borde azul y animación sólo si NO está colocado */}
      <div
        style={{
          width: CIRCLE_SIZE,
          height: CIRCLE_SIZE,
          borderRadius: '50%',
          overflow: 'hidden',
          background: '#fff',
          border: '2px solid #2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          animation: placed
            ? 'none'
            : 'dish-wobble 0.8s ease-in-out infinite alternate',
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: 8, padding: 2 }}>{name}</span>
        )}
      </div>

      {/* Nombre debajo del círculo */}
      <div
        style={{
          marginTop: 4,
          fontSize: 9,
          lineHeight: 1.1,
          maxWidth: 70,
        }}
      >
        {name}
      </div>
    </div>
  );
}



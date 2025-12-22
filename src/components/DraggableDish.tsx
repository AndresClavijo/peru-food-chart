'use client';

import { useEffect, useRef, useState } from 'react';

type DraggableDishProps = {
  id: number;
  name: string;
  imageUrl?: string;
  initialX?: number; // 0..1 → posición horizontal en la bandeja
  initialY?: number; // 0..1 → para filas en la bandeja
  onChange?: (id: number, x: number, y: number) => void;
};

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
  const [posPx, setPosPx] = useState<{ left: number; top: number } | null>(null);

  // Tamaño del plano (coincide con ChartBoard)
  const BOARD_HEIGHT = 500;
  const TRAY_MARGIN_TOP = 20;   // separación entre plano y bandeja
  const TRAY_ROW_HEIGHT = 80;   // alto de cada "fila" de platos

  // Posición inicial en la bandeja (debajo del plano)
  useEffect(() => {
    const dragArea = document.getElementById('drag-area');
    if (!dragArea || !ref.current) return;

    const rectArea = dragArea.getBoundingClientRect();
    const rectDish = ref.current.getBoundingClientRect();

    const trayTop = BOARD_HEIGHT + TRAY_MARGIN_TOP; // empieza debajo del plano

    const left = initialX * rectArea.width - rectDish.width / 2;
    const top = trayTop + initialY * TRAY_ROW_HEIGHT;

    const clampedLeft = Math.max(0, Math.min(rectArea.width - rectDish.width, left));
    const clampedTop = Math.max(0, Math.min(rectArea.height - rectDish.height, top));

    setPosPx({ left: clampedLeft, top: clampedTop });
  }, [initialX, initialY]);

  // Drag dentro de drag-area
  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!dragging || !ref.current) return;
      const dragArea = document.getElementById('drag-area');
      if (!dragArea) return;

      const rectArea = dragArea.getBoundingClientRect();
      const rectDish = ref.current.getBoundingClientRect();

      let left = e.clientX - rectArea.left - rectDish.width / 2;
      let top = e.clientY - rectArea.top - rectDish.height / 2;

      left = Math.max(0, Math.min(rectArea.width - rectDish.width, left));
      top = Math.max(0, Math.min(rectArea.height - rectDish.height, top));

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

      // Centro del plato en coordenadas de pantalla
      const centerX = rectDish.left + rectDish.width / 2;
      const centerY = rectDish.top + rectDish.height / 2;

      // Posición relativa dentro del plano
      const relX = centerX - rectBoard.left;
      const relY = centerY - rectBoard.top;

      // Si está fuera del plano, ignoramos el voto (no actualizamos)
      if (
        relX < 0 ||
        relX > rectBoard.width ||
        relY < 0 ||
        relY > rectBoard.height
      ) {
        return;
      }

      const xNorm = relX / rectBoard.width;        // 0 = barato, 1 = caro
      const yNorm = 1 - relY / rectBoard.height;   // 0 = no tan rico, 1 = muy rico

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
        width: 64,
        height: 64,
        cursor: dragging ? 'grabbing' : 'grab',
        borderRadius: '50%',
        overflow: 'hidden',
        background: '#fff',
        border: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        left: posPx ? posPx.left : 0,
        top: posPx ? posPx.top : 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: 10,
        textAlign: 'center',
        padding: 4,
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


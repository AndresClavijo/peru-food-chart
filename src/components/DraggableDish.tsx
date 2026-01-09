'use client';

import React, { useEffect, useRef, useState } from 'react';

type DraggableDishProps = {
  id: number;
  name: string;
  imageUrl?: string;
  /**
   * Posición inicial horizontal en la bandeja, normalizada 0..1
   * (0 = extremo izquierdo, 1 = extremo derecho).
   */
  initialX: number;
  /**
   * Se llama SOLO cuando el plato se suelta DENTRO del plano cartesiano.
   * x,y están normalizados en [0,1], con:
   *   x = 0 izq, 1 der
   *   y = 0 abajo, 1 arriba
   */
  onChange: (id: number, x: number, y: number) => void;
  placedPos?: { x: number; y: number }; // Posición normalizada (0..1) si ya está en el plano
};

type Pos = { x: number; y: number };

// Bandeja en UNA sola fila, por encima del plano
const TRAY_Y = 5; // píxeles desde el borde superior del drag-area

export default function DraggableDish({
  id,
  name,
  imageUrl,
  initialX,
  onChange,
  placedPos,
}: DraggableDishProps) {
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasBeenPlaced, setHasBeenPlaced] = useState(!!placedPos);
  const [pointerType, setPointerType] = useState<'mouse' | 'touch' | null>(
    null,
  );

  const lastClientPos = useRef<{ x: number; y: number } | null>(null);

  // Posición inicial: si trae placedPos, calcular pixel respecto al chart. Si no, usar initialX en bandeja.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dragArea = document.getElementById('drag-area');
    if (!dragArea) return;

    if (placedPos) {
      // Calcular posición basada en el ChartBoard
      const chart = document.getElementById('chart-board');
      if (chart) {
        const chartRect = chart.getBoundingClientRect();
        const areaRect = dragArea.getBoundingClientRect();

        // Relativo al drag-area
        // x = chartLeft - areaLeft + normalizedX * chartWidth
        const relLeft = chartRect.left - areaRect.left;
        const relTop = chartRect.top - areaRect.top;

        const x = relLeft + placedPos.x * chartRect.width;
        const y = relTop + (1 - placedPos.y) * chartRect.height; // y=1 es arriba (0 en SVG)

        setPos({ x, y });
        setHasBeenPlaced(true);
        return;
      }
    }

    // Fallback o modo bandeja
    const areaWidth = dragArea.getBoundingClientRect().width;
    const x = initialX * areaWidth;
    const y = TRAY_Y;

    setPos({ x, y });
    // Si NO hay placedPos, asumimos que no ha sido colocado (está en bandeja)
    if (!placedPos) setHasBeenPlaced(false);
  }, [initialX, placedPos]);

  // Traducir coordenadas del puntero a coordenadas dentro de drag-area
  function updatePositionFromClient(clientX: number, clientY: number) {
    const dragArea = document.getElementById('drag-area');
    if (!dragArea) return;

    const rect = dragArea.getBoundingClientRect();
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;

    const clampedX = Math.max(0, Math.min(rect.width, rawX));
    const clampedY = Math.max(0, Math.min(rect.height, rawY));

    setPos({ x: clampedX, y: clampedY });
  }

  function startDrag(clientX: number, clientY: number, type: 'mouse' | 'touch') {
    setIsDragging(true);
    setPointerType(type);
    lastClientPos.current = { x: clientX, y: clientY };
    updatePositionFromClient(clientX, clientY);
  }

  // Inicio con mouse
  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    startDrag(e.clientX, e.clientY, 'mouse');
  }

  // Inicio con dedo
  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    e.preventDefault();
    const t = e.touches[0];
    if (!t) return;
    startDrag(t.clientX, t.clientY, 'touch');
  }

  // Listeners globales mientras arrastras
  useEffect(() => {
    if (!isDragging || !pointerType) return;

    function handleMouseMove(e: MouseEvent) {
      if (!isDragging || pointerType !== 'mouse') return;
      e.preventDefault();
      lastClientPos.current = { x: e.clientX, y: e.clientY };
      updatePositionFromClient(e.clientX, e.clientY);
    }

    function handleMouseUp(e: MouseEvent) {
      if (!isDragging || pointerType !== 'mouse') return;
      e.preventDefault();
      finishDrag(e.clientX, e.clientY);
    }

    function handleTouchMove(e: TouchEvent) {
      if (!isDragging || pointerType !== 'touch') return;
      const t = e.touches[0];
      if (!t) return;
      e.preventDefault();
      lastClientPos.current = { x: t.clientX, y: t.clientY };
      updatePositionFromClient(t.clientX, t.clientY);
    }

    function handleTouchEnd(e: TouchEvent) {
      if (!isDragging || pointerType !== 'touch') return;
      e.preventDefault();
      const t = e.changedTouches[0];
      const clientX = t?.clientX ?? lastClientPos.current?.x ?? 0;
      const clientY = t?.clientY ?? lastClientPos.current?.y ?? 0;
      finishDrag(clientX, clientY);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDragging, pointerType]);

  function finishDrag(clientX: number, clientY: number) {
    setIsDragging(false);
    setPointerType(null);

    const chart = document.getElementById('chart-board');
    if (!chart) return;

    const rect = chart.getBoundingClientRect();

    const inside =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;

    if (!inside) {
      // Se soltó fuera del plano: el plato se queda ahí, pero no registramos voto.
      return;
    }

    // Coordenadas normalizadas [0,1]
    const nx = (clientX - rect.left) / rect.width;
    const ny = 1 - (clientY - rect.top) / rect.height; // 1 = arriba, 0 = abajo

    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    const xNorm = clamp01(nx);
    const yNorm = clamp01(ny);

    onChange(id, xNorm, yNorm);
    setHasBeenPlaced(true);
  }

  const wobbleAnimation =
    !hasBeenPlaced && !isDragging
      ? 'dish-wobble 0.55s ease-in-out infinite alternate'
      : 'none';

  const outerSize = 56;
  const innerSize = 48;

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -50%)',
        width: outerSize,
        height: outerSize,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        zIndex: isDragging ? 20 : 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        animation: wobbleAnimation,
      }}
    >
      <div
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid #1d4ed8',
          background: '#fff',
          boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: 11, padding: '0 4px', textAlign: 'center' }}>
            {name}
          </span>
        )}
      </div>

      {/* Nombre debajo mientras está en la bandeja */}
      {!hasBeenPlaced && (
        <div
          style={{
            position: 'absolute',
            top: outerSize,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 10,
            textAlign: 'center',
            maxWidth: 80,
            color: '#111827',
          }}
        >
          {name}
        </div>
      )}
    </div>
  );
}

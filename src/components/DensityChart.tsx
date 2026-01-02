'use client';

import React, { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { contourDensity } from 'd3-contour';
import { max } from 'd3-array';
import { geoPath } from 'd3-geo';

type DensityPoint = { x: number; y: number; count?: number };

type DensityChartProps = {
    width?: number;
    height?: number;
    points: DensityPoint[];
    average?: { x: number; y: number } | null;
    userVote?: { x: number; y: number } | null;
};

const defaultWidth = 180;
const defaultHeight = 180;
const GRID_STEPS = 6;

export default function DensityChart({
    width = defaultWidth,
    height = defaultHeight,
    points,
    average,
    userVote,
}: DensityChartProps) {
    // margen para labels y cuadrícula interna
    const margin = 26;

    const innerLeft = margin;
    const innerRight = width - margin;
    const innerTop = margin;
    const innerBottom = height - margin;
    const innerWidth = innerRight - innerLeft;
    const innerHeight = innerBottom - innerTop;

    // escalas (0–1 → área interna)
    const xs = useMemo(
        () => scaleLinear().domain([0, 1]).range([innerLeft, innerRight]),
        [innerLeft, innerRight]
    );
    const ys = useMemo(
        () => scaleLinear().domain([0, 1]).range([innerBottom, innerTop]),
        [innerBottom, innerTop]
    );

    // contornos de densidad
    const contours = useMemo(() => {
        if (!points || points.length === 0) return [];

        const density = contourDensity<DensityPoint>()
            .x((d) => xs(d.x))
            .y((d) => ys(d.y))
            .size([width, height])
            .bandwidth(15)
            .weight((d) => d.count ?? 1);

        return density(points);
    }, [points, xs, ys, width, height]);

    const maxValue = useMemo(
        () => (contours.length ? max(contours, (c) => c.value) ?? 0 : 0),
        [contours]
    );

    const pathGenerator = useMemo(() => geoPath(), []);

    const colorFor = (value: number) => {
        if (maxValue === 0) return 'rgba(236,72,153,0.15)';
        const t = value / maxValue;
        const alpha = 0.18 + t * 0.35;
        return `rgba(236,72,153,${alpha.toFixed(2)})`;
    };

    // posiciones de las líneas para 6x6 cuadrantes
    const positions = Array.from(
        { length: GRID_STEPS - 1 },
        (_, i) => innerLeft + ((i + 1) / GRID_STEPS) * innerWidth
    );

    const centerIndex = Math.floor((GRID_STEPS - 1) / 2);

    return (
        <svg width={width} height={height}>
            {/* fondo */}
            <rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill="#f9fafb"
                stroke="#e5e7eb"
            />

            {/* cuadrícula interna */}
            {/* líneas verticales */}
            {positions.map((x, idx) => {
                const isCenter = idx === centerIndex;
                return (
                    <line
                        key={`v-${idx}`}
                        x1={x}
                        y1={innerTop}
                        x2={x}
                        y2={innerBottom}
                        stroke={isCenter ? '#111827' : 'rgba(0,0,0,0.18)'}
                        strokeWidth={isCenter ? 2 : 1}
                    />
                );
            })}

            {/* líneas horizontales */}
            {positions.map((x, idx) => {
                // reusar positions para Y: convertimos x→y
                const frac = (idx + 1) / GRID_STEPS;
                const y = innerTop + frac * innerHeight;
                const isCenter = idx === centerIndex;
                return (
                    <line
                        key={`h-${idx}`}
                        x1={innerLeft}
                        y1={y}
                        x2={innerRight}
                        y2={y}
                        stroke={isCenter ? '#111827' : 'rgba(0,0,0,0.18)'}
                        strokeWidth={isCenter ? 2 : 1}
                    />
                );
            })}

            {/* contornos de densidad */}
            <g>
                {contours.map((contour, i) => (
                    <path
                        key={i}
                        d={pathGenerator(contour) ?? undefined}
                        fill={colorFor(contour.value)}
                        stroke="rgba(136,19,55,0.6)"
                        strokeWidth={0.8}
                    />
                ))}
            </g>

            {/* punto promedio */}
            {average && (
                <circle cx={xs(average.x)} cy={ys(average.y)} r={5} fill="#000" />
            )}

            {/* punto del usuario */}
            {userVote && (
                <circle
                    cx={xs(userVote.x)}
                    cy={ys(userVote.y)}
                    r={4}
                    fill="#000"
                    stroke="#fff"
                    strokeWidth={1}
                />
            )}

            {/* etiquetas de ejes (mini versión) */}
            {/* Arriba: Barato */}
            /* Arriba: Caro */
            <text
                x={(innerLeft + innerRight) / 2}
                y={innerTop - 8}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                fill="#111827"
            >
                Caro
            </text>

/* Abajo: Barato */
            <text
                x={(innerLeft + innerRight) / 2}
                y={innerBottom + 12}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                fill="#111827"
            >
                Barato
            </text>


            {/* Izquierda: No tan rico */}
            <text
                x={innerLeft - 4}
                y={(innerTop + innerBottom) / 2}
                textAnchor="end"
                fontSize={8.5}
                fontWeight={600}
                fill="#111827"
            >
                No tan rico
            </text>

            {/* Derecha: Rico */}
            <text
                x={innerRight + 4}
                y={(innerTop + innerBottom) / 2}
                textAnchor="start"
                fontSize={9}
                fontWeight={600}
                fill="#111827"
            >
                Rico
            </text>
        </svg>
    );
}


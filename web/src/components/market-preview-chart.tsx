"use client";

import { useMemo } from "react";

import { type ChartPoint } from "@/lib/fake-market-data";

type MarketPreviewChartProps = {
  data: ChartPoint[];
  probability: number;
  selectedShare: "YES" | "NO";
  onToggleShare: () => void;
};

const CHART_WIDTH = 400;
const CHART_HEIGHT = 200;
const PADDING = { top: 8, right: 36, bottom: 24, left: 8 };

function formatAxisDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: "UTC" });
}

function buildPath(points: ChartPoint[]): string {
  if (points.length === 0) return "";

  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const coords = points.map((point, index) => {
    const x = PADDING.left + (index / Math.max(points.length - 1, 1)) * innerWidth;
    const y = PADDING.top + (1 - point.y / 100) * innerHeight;
    return { x, y };
  });

  if (coords.length === 1) {
    return `M ${coords[0].x} ${coords[0].y}`;
  }

  let path = `M ${coords[0].x} ${coords[0].y}`;
  for (let index = 1; index < coords.length; index += 1) {
    const prev = coords[index - 1];
    const current = coords[index];
    const controlX = (prev.x + current.x) / 2;
    path += ` C ${controlX} ${prev.y}, ${controlX} ${current.y}, ${current.x} ${current.y}`;
  }
  return path;
}

export function MarketPreviewChart({
  data,
  probability,
  selectedShare,
  onToggleShare,
}: MarketPreviewChartProps) {
  const color = selectedShare === "YES" ? "var(--color-yes)" : "var(--color-no)";
  const path = useMemo(() => buildPath(data), [data]);
  const lastPoint = data[data.length - 1];
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const lastX = PADDING.left + innerWidth;
  const lastY = lastPoint
    ? PADDING.top + (1 - lastPoint.y / 100) * innerHeight
    : PADDING.top + innerHeight / 2;
  const gridSteps = [0, 20, 40, 60, 80, 100];

  return (
    <div className="preview-chart">
      <div className="preview-chart__header">
        <span className="preview-chart__probability" style={{ color }}>
          {(probability * 100).toFixed(0)}% probability
        </span>
        <span className="preview-chart__demo">Demo data</span>
      </div>

      <svg
        className="preview-chart__svg"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label={`${selectedShare} probability over time`}
      >
        {gridSteps.map((step) => {
          const y = PADDING.top + (1 - step / 100) * innerHeight;
          return (
            <g key={step}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={CHART_WIDTH - PADDING.right}
                y2={y}
                className="preview-chart__grid-line"
              />
              <text x={CHART_WIDTH - 4} y={y + 4} className="preview-chart__axis-label" textAnchor="end">
                {step}%
              </text>
            </g>
          );
        })}

        <path d={path} className="preview-chart__line" style={{ stroke: color }} />
        <circle
          cx={lastX}
          cy={lastY}
          r={4}
          fill={color}
          stroke="#ffffff"
          strokeWidth={2}
        />
      </svg>

      <div className="preview-chart__footer">
        <span className="preview-chart__date">
          {lastPoint ? formatAxisDate(lastPoint.x) : ""}
        </span>
        <button type="button" className="preview-chart__toggle" onClick={onToggleShare}>
          View {selectedShare === "YES" ? "NO" : "YES"}
        </button>
      </div>
    </div>
  );
}

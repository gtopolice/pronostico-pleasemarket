"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { FilterButton } from "../buttons/filter-button";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import React, { ReactNode, useEffect, useState } from "react";
import { UpIcon } from "../assets/icons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Custom plugin for evenly spaced grid lines
const gridLinePlugin = {
  id: "customGridLines",
  beforeDraw(chart: any, args: any, options: any) {
    if (options?.display === false) return;

    const yAxis = chart.scales.y;
    if (!yAxis) return;

    const ctx = chart.ctx;
    const chartArea = chart.chartArea;

    // Get the color of the CSS variable dynamically
    const getCSSVariable = (varName: string): string => {
      if (typeof window !== "undefined") {
        return getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();
      }
      return "";
    };

    const outlineVariantColor =
      getCSSVariable("--outline-variant") || "rgba(0, 0, 0, 0.38)";

    // Draw lines at ALL evenly spaced positions (every 10 units)
    const stepSize = 10;
    const min = 0;
    const max = 100;

    for (let value = min; value <= max; value += stepSize) {
      const y = yAxis.getPixelForValue(value);
      if (y >= chartArea.top && y <= chartArea.bottom) {
        ctx.save();
        ctx.strokeStyle = outlineVariantColor;
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(chartArea.left, y);
        ctx.lineTo(chartArea.right, y);
        ctx.stroke();
        ctx.restore();
      }
    }
  },
};

// ChartJS.register(gridLinePlugin); // Remove global registration

// #region Sample data
const data = [0, 15, 20, 35, 95, 100];

// #endregion
interface ChartProps {
  logo?: ReactNode;
  data?: { x: string; y: number }[];
  probability?: number;
  selectedShare?: "YES" | "NO";
  onChangeSelectedShare?: (share: "YES" | "NO") => void;
  showDates?: boolean;
  showPercentages?: boolean;
  showGrid?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  height?: number | string;
  noPadding?: boolean;
  labels?: {
    probability?: string;
  };
}
const ChartImpl = ({
  logo,
  data: initialData,
  probability,
  selectedShare = "YES",
  onChangeSelectedShare,
  showDates = true,
  showPercentages = true,
  showGrid = true,
  showHeader = true,
  showFooter = true,
  height = 200,
  noPadding = false,
  labels = {},
}: ChartProps) => {
  const defaultLabels = {
    probability: "probabilidad",
  };
  const l = { ...defaultLabels, ...labels };
  // Get the color of the CSS variable
  const getCSSVariable = (varName: string): string => {
    if (typeof window !== "undefined") {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
    }
    return "";
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const outlineVariantColor =
    getCSSVariable("--outline-variant") || "rgba(0, 0, 0, 0.38)";

  const chartColor = selectedShare === "YES"
    ? (getCSSVariable("--color-yes"))
    : (getCSSVariable("--color-no"));

  // Format data for Chart.js
  const displayData = initialData?.map((item) => item.y) || [];
  const displayLabels = initialData?.map((item) => {
    const date = new Date(item.x);
    if (!isNaN(date.getTime())) {
      if (isMobile) {
        const monthLong = date.toLocaleDateString("es-ES", {
          month: "long",
          timeZone: "UTC",
        });
        return monthLong.charAt(0).toUpperCase() + monthLong.slice(1);
      }
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      });
    }
    return item.x;
  }) || ["", "", "", "", "", ""];

  const chartData = {
    labels: displayLabels,
    datasets: [
      {
        label: "",
        data: displayData,
        borderColor: chartColor,
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: (ctx: any) => {
          const index = ctx.dataIndex;
          const dataset = ctx.dataset.data;
          // Only show circle for the last point
          return index === dataset.length - 1 ? 4 : 0;
        },
        pointBackgroundColor: chartColor,
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        fill: false,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: noPadding ? 6 : 0,
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    animations: {
      y: {
        easing: "easeInOutQuart" as const,
        duration: 800,
        delay: (ctx: any) => {
          if (ctx.type !== "data" || ctx.xStarted) {
            return 0;
          }
          ctx.xStarted = true;
          return ctx.index * 100; // Delay based on index for progressive effect
        },
      },
    },
    plugins: {
      customGridLines: {
        display: showGrid,
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: "Roboto",
        },
        bodyFont: {
          family: "Roboto",
        },
        callbacks: {
          title: function (context: any) {
            const index = context[0].dataIndex;
            const item = initialData?.[index];
            if (item) {
              const date = new Date(item.x);
              if (!isNaN(date.getTime())) {
                const dayMonth = date.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  timeZone: "UTC",
                });
                return dayMonth.charAt(0).toUpperCase() + dayMonth.slice(1);
              }
            }
            return context[0].label;
          },
          label: function (context: any) {
            return `${l.probability}: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      x: {
        display: showDates && !isMobile,
        border: {
          display: false,
        },
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          padding: 8,
          maxTicksLimit: isMobile ? 1 : undefined,
          autoSkip: true,
          align: isMobile ? ("center" as const) : undefined,
          font: {
            family: "Roboto",
            weight: 500,
            lineHeight: "16px",
            letterSpacing: "0.5px",
            size: 11,
          },
          color: outlineVariantColor,
          callback: function (
            this: any,
            value: any,
            index: number,
            ticks: any[]
          ) {
            const label = this.getLabelForValue(value);
            if (isMobile) {
              return label; // With maxTicksLimit: 1, this will be the centered month
            }
            if (index > 0) {
              const prevLabel = this.getLabelForValue(ticks[index - 1].value);
              if (label === prevLabel) return "";
            }
            return label;
          },
        },
      },
      y: {
        display: showPercentages,
        position: "right" as const,
        border: {
          display: false,
        },
        grid: {
          display: false, // Disable default grid lines, the plugin will draw them
          drawBorder: false,
        },
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20, // Force every 10 units
          autoSkip: false, // Prevent Chart.js from skipping labels
          precision: 0, // No decimals
          callback: function (value: any) {
            // Show all labels of the evenly spaced lines
            return value + "%";
          },
          font: {
            family: "Roboto",
            weight: 500,
            lineHeight: "16px",
            letterSpacing: "0.5px",
            size: 11,
          },
          color: outlineVariantColor,
        },
      },
    },
  };

  return (
    <div
      style={{
        width: "100%",
        padding: noPadding ? "0" : "0 16px",
        gap: "16px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {showHeader && (
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row items-center justify-start gap-2 w-full">
            {showPercentages && (
              <span
                className="text-[14px] leading-[20px] tracking-[0.1px] font-[700]"
                style={{ color: chartColor }}
              >
                {((probability ?? 0) * 100).toFixed(0) ?? "--"}% {l.probability}
              </span>
            )}
            {/*<div className="flex flex-row items-center justify-start gap-0">
              <UpIcon
                color="var(--text-on-primary-button)"
                height={10}
                width={10}
              />
              <span className="text-[var(--text-on-primary-button)] text-[11px] leading-[16px] tracking-[0.5px] font-[500]">
                13%
              </span>
            </div> */}
          </div>
          {logo}
        </div>
      )}

      <div style={{ width: "100%", height: height }}>
        <Line data={chartData} options={options} plugins={[gridLinePlugin]} />
      </div>

      {showDates && isMobile && displayLabels.length > 0 && (
        <div className="flex justify-center w-full -mt-2">
          <span
            className="text-[11px] leading-[16px] tracking-[0.5px] font-[500]"
            style={{ color: outlineVariantColor }}
          >
            {displayLabels[displayLabels.length - 1]}
          </span>
        </div>
      )}
      {showFooter && (
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center">
            {/*{dateFilters.map((dateFilter) => (
              <FilterButton
                key={dateFilter.value}
                label={dateFilter.label}
                isSelected={dateFilter.isSelected}
              >
                {dateFilter.label}
              </FilterButton>
            ))} */}
          </div>

          <ShuffleIcon
            style={{ fontSize: 24 }}
            className="text-[var(--on-surface-variant)] cursor-pointer"
            onClick={() => {
              onChangeSelectedShare?.(selectedShare === "YES" ? "NO" : "YES");
            }}
          />
        </div>
      )}
    </div>
  );
};

export const Chart = React.memo(ChartImpl, (prev, next) => {
  if (prev.selectedShare !== next.selectedShare) return false;
  if (prev.probability !== next.probability) return false;
  if (prev.height !== next.height) return false;

  // Compare chart data arrays by length and values
  if (prev.data === next.data) return true;
  if (!prev.data || !next.data) return false;
  if (prev.data.length !== next.data.length) return false;

  for (let i = 0; i < prev.data.length; i++) {
    if (prev.data[i].x !== next.data[i].x || prev.data[i].y !== next.data[i].y) {
      return false;
    }
  }

  return true;
});

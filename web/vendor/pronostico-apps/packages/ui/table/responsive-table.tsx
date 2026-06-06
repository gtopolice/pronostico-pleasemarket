"use client";

import * as React from "react";

export interface TableColumn {
  key: string;
  label: string;
}

export interface TableRow {
  [key: string]: React.ReactNode;
  id?: string;
}

export interface ResponsiveTableProps {
  headers: TableColumn[];
  rows: TableRow[];
  maxHeight?: number;
  disableMaxHeight?: boolean;
  onClickItem?: (id: string) => void;
}

export function ResponsiveTable({
  headers,
  rows,
  maxHeight: maxHeightProps,
  disableMaxHeight,
  onClickItem,
}: ResponsiveTableProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = React.useState<number | undefined>(
    undefined
  );

  React.useEffect(() => {
    if (disableMaxHeight) {
      setMaxHeight(undefined);
      return;
    }

    if (maxHeightProps) {
      setMaxHeight(maxHeightProps);
      return;
    }

    const calculateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 20; // 20px padding from bottom
        setMaxHeight(availableHeight);
      }
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    return () => {
      window.removeEventListener("resize", calculateHeight);
    };
  }, [maxHeightProps]);

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col z-0"
      style={{
        maxHeight: maxHeight ? `${maxHeight}px` : "100%",
        overflow: "hidden",
      }}
    >
      <div
        className={`w-full overflow-x-auto flex-1 ${disableMaxHeight ? "overflow-y-visible" : "overflow-y-auto"}`}
      >
        <div className="min-w-full inline-block">
          <table className="w-full border-collapse">
            {/* Header */}
            <thead
              style={{
                borderBottom: "1px solid var(--outline-variant)",
                position: "sticky",
                top: 0,
                backgroundColor: "var(--surface)",
                zIndex: 10,
              }}
            >
              <tr>
                {headers.map((header, headerIndex) => (
                  <th
                    key={header.key}
                    className="py-3"
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      lineHeight: "20px",
                      letterSpacing: "0.25px",
                      color: "var(--surface-tint)",
                      textAlign: headerIndex === 0 ? "left" : "center",
                      maxWidth: headerIndex === 0 ? "450px" : "180px",
                      paddingLeft: headerIndex === 0 ? "24px" : "16px",
                      paddingRight: "16px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            {/* Body */}
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onClickItem && onClickItem(row.id || "")}
                  className="border-b border-zinc-50 last:border-none"
                >
                  {headers.map((header, headerIndex) => (
                    <td
                      key={header.key}
                      className="py-4 cursor-pointer text-[var(--primary)]"
                      style={{
                        textAlign: headerIndex === 0 ? "left" : "center",
                        maxWidth: headerIndex === 0 ? "450px" : "180px",
                        paddingLeft: headerIndex === 0 ? "24px" : "16px",
                        paddingRight: "16px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row[header.key] || ""}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="h-[10px] w-full"></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

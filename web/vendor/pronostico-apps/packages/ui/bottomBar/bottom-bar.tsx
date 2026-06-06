"use client";

import React from "react";
import { HomeIcon } from "../assets/icons";
import SearchIcon from "@mui/icons-material/Search";
import { useMemo } from "react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface BottomBarProps {
  onCHangeRoute: (_route: string) => void;
  currentRoute: string;
  items?: NavItem[];
}

export function BottomBar({
  onCHangeRoute,
  currentRoute,
  items,
}: BottomBarProps) {
  const defaultItems = useMemo(
    () => [
      {
        label: "Inicio",
        icon: <HomeIcon color="var(--on-surface)" height={18} width={18} />,
        href: "/home",
      },
      {
        label: "Buscar",
        icon: (
          <SearchIcon
            sx={{
              fontSize: 20,
              color: "var(--on-surface)",
            }}
          />
        ),
        href: "search",
      },
    ],
    []
  );

  const navItems = items || defaultItems;

  const activatedClass = (route: string) => {
    if (currentRoute?.includes(route)) {
      return " bg-[var(--secondary-container)] w-full max-w-[64px]";
    }
    return " w-full max-w-[64px] bg-transparent";
  };

  const activatedColor = (route: string) => {
    if (currentRoute?.includes(route)) {
      return " text-[var(--on-secondary-container)]";
    }
    return " text-[var(--on-surface-variant)]";
  };

  // Helper to apply color to icon based on active state
  const getIconWithColor = (icon: React.ReactNode, route: string) => {
    const isActive = currentRoute?.includes(route);
    const activeColor = isActive ? "var(--on-secondary-container)" : "var(--on-surface-variant)";
    
    // Clone the icon and apply the color
    return React.cloneElement(icon as React.ReactElement<any>, {
      ...(icon && (icon as React.ReactElement<any>).props && (icon as React.ReactElement<any>).props.color !== undefined
        ? { color: activeColor }
        : {}),
      sx: {
        ...((icon as React.ReactElement<any>).props?.sx || {}),
        color: activeColor,
      },
    });
  };

  return (
    <>
      <div className="w-full fixed bottom-0 left-0 right-0 bg-[var(--surface-container-low)] flex items-center justify-between z-[1000] border-t border-[var(--outline-variant)] py-[5px]">
        {navItems.map((item) => (
          <div
            onClick={() => onCHangeRoute(item.href)}
            key={item.label}
            className="w-full flex justify-center items-center cursor-pointer"
          >
            <div
              style={{ padding: "3px 2px", borderRadius: "16px" }}
              className={`${activatedClass(item.href)} flex flex-col items-center justify-center gap-[2px] transition-colors`}
            >
              {getIconWithColor(item.icon, item.href)}
              <span className={`text-[10px] font-[500] leading-[12px] ${activatedColor(item.href)}`}>
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

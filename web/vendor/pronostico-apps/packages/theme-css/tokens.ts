/**
 * Material Design Theme Tokens
 *
 * This file exports the theme tokens directly from the JSON file.
 * TypeScript will automatically infer types from the JSON structure.
 */

import tokens from "./matherial-theme.json";

export default tokens;
export const materialTheme = tokens;

// Type exports for better TypeScript support
export type MaterialTheme = typeof tokens;
export type SysTheme = typeof tokens.sys;
export type LightTheme = typeof tokens.sys.light;
export type DarkTheme = typeof tokens.sys.dark;
export type ColorKey = keyof LightTheme;

// Helper function to get a color value
export function getColor(theme: "light" | "dark", color: ColorKey): string {
  const value = tokens.sys[theme][color];

  // Handle cases where value might be an object (like on-surface-variant with variants)
  if (typeof value === "string") {
    return value;
  }

  // If it's an object, try to get the first string value or '0' key
  if (typeof value === "object" && value !== null) {
    if ("0" in value && typeof value[0] === "string") {
      return value[0];
    }
    // Try to find first string value
    const firstStringValue = Object.values(value).find(
      (v) => typeof v === "string"
    ) as string | undefined;
    if (firstStringValue) {
      return firstStringValue;
    }
  }

  // Fallback
  return "#000000ff";
}

#!/usr/bin/env node

/**
 * Script to generate CSS variables from Material Design theme tokens
 *
 * Reads matherial-theme.json and generates globals.css with CSS variables
 * for light and dark themes.
 */

import * as fs from "fs";
import * as path from "path";

const THEME_FILE = path.join(__dirname, "../matherial-theme.json");
const OUTPUT_FILE = path.join(__dirname, "../globals.css");

interface ThemeColors {
  [key: string]: string | { [key: string]: string };
}

/**
 * Convert a color value to CSS format
 * Handles both string colors and object variants
 */
function getColorValue(value: string | { [key: string]: string }): string {
  if (typeof value === "string") {
    return convertHexToRgb(value);
  }

  // If it's an object, use the '0' key or first string value
  if (typeof value === "object" && value !== null) {
    if ("0" in value && typeof value[0] === "string") {
      return convertHexToRgb(value[0]);
    }
    const firstStringValue = Object.values(value).find(
      (v) => typeof v === "string"
    ) as string | undefined;
    if (firstStringValue) {
      return convertHexToRgb(firstStringValue);
    }
  }

  return "#000000";
}

/**
 * Convert hex color with alpha to rgba or hex format
 * Example: #ffffffff -> #ffffff or rgba(255, 255, 255, 1)
 */
function convertHexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace("#", "");

  // Handle 8-digit hex (with alpha)
  if (hex.length === 8) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = parseInt(hex.substring(6, 8), 16) / 255;

    // If alpha is 1, return hex without alpha
    if (a === 1) {
      return `#${hex.substring(0, 6)}`;
    }

    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // Handle 6-digit hex
  if (hex.length === 6) {
    return `#${hex}`;
  }

  return `#${hex}`;
}

/**
 * Convert camelCase or kebab-case to CSS variable name
 */
function toCssVarName(key: string): string {
  // Keep as-is (already kebab-case or has dashes)
  return `--${key}`;
}

/**
 * Generate CSS variables for a theme
 */
function generateThemeVars(colors: ThemeColors, indent: string = "  "): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(colors)) {
    const cssVarName = toCssVarName(key);
    const cssValue = getColorValue(value);
    lines.push(`${indent}${cssVarName}: ${cssValue};`);
  }

  return lines.join("\n");
}

/**
 * Main function
 */
function main() {
  console.log("📖 Reading theme tokens...");

  const themeData = JSON.parse(fs.readFileSync(THEME_FILE, "utf8"));

  if (!themeData.sys || !themeData.sys.light || !themeData.sys.dark) {
    throw new Error("Invalid theme structure. Expected sys.light and sys.dark");
  }

  const lightColors = themeData.sys.light as ThemeColors;
  const darkColors = themeData.sys.dark as ThemeColors;

  console.log("🔧 Generating CSS variables...");

  // Generate CSS content
  const cssContent = `/* ============================================
   MATERIAL DESIGN THEME - CSS Variables
   Generated from matherial-theme.json
   DO NOT EDIT MANUALLY - Run: pnpm generate:css
   ============================================ */

/* ============================================
   LIGHT THEME - Material Design Colors
   ============================================ */
:root {
${generateThemeVars(lightColors)}
}

/* ============================================
   DARK THEME - Material Design Colors
   ============================================ */
[data-theme="dark"],
.dark {
${generateThemeVars(darkColors)}
}

/* ============================================
   COMPATIBILITY VARIABLES - For existing code
   These map to Material Design colors for backward compatibility
   ============================================ */
:root {
  /* Background and Surface */
  --background: var(--surface);
  --foreground: var(--on-surface);
  
  /* Text colors */
  --text-primary: var(--on-surface);
  --text-secondary: var(--on-surface-variant);
  --text-on-neutral: var(--on-surface);
  
  /* Border colors */
  --border-card-color: var(--outline);
  
  /* Button colors - using custom colors from extended palette */
  --primary-button-bg: rgba(22, 246, 152, 0.3);
  --text-on-primary-button: #006c3f;
  --secondary-button-bg: rgba(148, 73, 243, 0.3);
  --text-on-secondary-button: #7a28d8;
  --tertiary-button-bg: rgba(27, 27, 27, 0.1);
  --text-on-tertiary-button: var(--on-surface);
  
  /* Icon colors */
  --primary-icon: var(--outline);
  --secondary-icon: var(--on-surface-variant);
  
  /* Other */
  --label-text-color: var(--outline);
  --text-on-brand: var(--on-surface);
  --tag-button-border-color: var(--outline);
  --tag-button-text-color: var(--on-surface-variant);
  --save-button-bg: var(--tertiary-container);
  --tag-button-selected-bg: var(--primary);
  --search-input-bg: var(--background);
  --search-input-text-color: var(--on-surface);
  --tertiary-text-color: var(--tertiary-container);
}

[data-theme="dark"],
.dark {
  /* Button colors for dark theme */
  --primary-button-bg: rgba(0, 108, 63, 0.4);
  --text-on-primary-button: #16f698;
  --secondary-button-bg: rgba(236, 34, 31, 0.2);
  --text-on-secondary-button: #ec221f;
  --tertiary-button-bg: var(--primary-container);
  --text-on-tertiary-button: var(--on-primary-container);
  
  /* Icon colors for dark theme */
  --primary-icon: var(--on-surface-variant);
  --secondary-icon: var(--on-surface-variant);
  
  /* Other dark theme overrides */
  --label-text-color: var(--on-surface-variant);
  --text-on-brand: var(--on-surface);
  --tag-button-border-color: var(--outline);
  --tag-button-text-color: var(--on-surface-variant);
  --save-button-bg: var(--on-surface-variant);
  --search-input-bg: var(--surface-container-high);
  --search-input-text-color: var(--on-surface-variant);
  --tertiary-text-color: var(--on-tertiary-container);
}

/* ============================================
   TAILWIND THEME INTEGRATION (v4)
   ============================================ */
@theme {
  --font-sans: var(--font-roboto, var(--font-geist-sans));
  --font-mono: var(--font-geist-mono);

  /* Material Design colors - available as Tailwind utilities */
  --color-primary: var(--primary);
  --color-on-primary: var(--on-primary);
  --color-primary-container: var(--primary-container);
  --color-on-primary-container: var(--on-primary-container);
  --color-secondary: var(--secondary);
  --color-on-secondary: var(--on-secondary);
  --color-secondary-container: var(--secondary-container);
  --color-on-secondary-container: var(--on-secondary-container);
  --color-tertiary: var(--tertiary);
  --color-on-tertiary: var(--on-tertiary);
  --color-tertiary-container: var(--tertiary-container);
  --color-on-tertiary-container: var(--on-tertiary-container);
  --color-error: var(--error);
  --color-on-error: var(--on-error);
  --color-error-container: var(--error-container);
  --color-on-error-container: var(--on-error-container);
  --color-background: var(--background);
  --color-on-background: var(--on-background);
  --color-surface: var(--surface);
  --color-on-surface: var(--on-surface);
  --color-surface-variant: var(--surface-variant);
  --color-on-surface-variant: var(--on-surface-variant);
  --color-outline: var(--outline);
  --color-outline-variant: var(--outline-variant);
  --color-surface-container-lowest: var(--surface-container-lowest);
  --color-surface-container-low: var(--surface-container-low);
  --color-surface-container: var(--surface-container);
  --color-surface-container-high: var(--surface-container-high);
  --color-surface-container-highest: var(--surface-container-highest);
}

/* ============================================
   GLOBAL STYLES
   ============================================ */
/* Apply Roboto globally to all text elements */
* {
  font-family: var(--font-roboto, var(--font-geist-sans), sans-serif);
}

body {
  font-family: var(--font-roboto, var(--font-geist-sans), sans-serif);
}
`;

  console.log("💾 Writing CSS file...");
  fs.writeFileSync(OUTPUT_FILE, cssContent, "utf8");

  console.log("✅ CSS variables generated successfully!");
  console.log(`📁 Output: ${OUTPUT_FILE}`);

  const lightCount = Object.keys(lightColors).length;
  const darkCount = Object.keys(darkColors).length;
  console.log(`📊 Generated ${lightCount} light theme variables`);
  console.log(`📊 Generated ${darkCount} dark theme variables`);
}

// Run if executed directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error("❌ Error generating CSS:", error);
    process.exit(1);
  }
}

export { main as generateCss };

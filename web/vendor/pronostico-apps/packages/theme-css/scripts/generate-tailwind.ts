#!/usr/bin/env node

/**
 * Script to generate Tailwind CSS configuration from Material Design theme tokens
 *
 * Reads matherial-theme.json and generates tailwind-theme.ts with color mappings
 * for use in Tailwind config.
 */

import * as fs from "fs";
import * as path from "path";

const THEME_FILE = path.join(__dirname, "../matherial-theme.json");
const OUTPUT_FILE = path.join(__dirname, "../tailwind-theme.ts");

interface ThemeColors {
  [key: string]: string | { [key: string]: string };
}

/**
 * Generate Tailwind color mappings
 */
function generateTailwindColors(colors: ThemeColors): string {
  const entries: string[] = [];

  for (const [key] of Object.entries(colors)) {
    // Use the key directly as the color name (already kebab-case)
    entries.push(`    '${key}': 'var(--${key})',`);
  }

  return entries.join("\n");
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

  console.log("🔧 Generating Tailwind theme configuration...");

  // Generate TypeScript content
  const tsContent = `/**
 * Tailwind CSS Theme Configuration
 * Generated from matherial-theme.json
 * DO NOT EDIT MANUALLY - Run: pnpm generate:tailwind
 * 
 * Usage in tailwind.config.ts:
 * 
 * import { tailwindTheme } from '@pronostico-apps/theme-css/tailwind-theme';
 * 
 * export default {
 *   theme: {
 *     extend: {
 *       colors: tailwindTheme.colors,
 *     },
 *   },
 * };
 */

export const tailwindTheme = {
  colors: {
${generateTailwindColors(lightColors)}
  },
} as const;

export type TailwindThemeColors = typeof tailwindTheme.colors;
`;

  console.log("💾 Writing Tailwind theme file...");
  fs.writeFileSync(OUTPUT_FILE, tsContent, "utf8");

  console.log("✅ Tailwind theme configuration generated successfully!");
  console.log(`📁 Output: ${OUTPUT_FILE}`);

  const colorCount = Object.keys(lightColors).length;
  console.log(`📊 Generated ${colorCount} color mappings`);
}

// Run if executed directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error("❌ Error generating Tailwind theme:", error);
    process.exit(1);
  }
}

export { main as generateTailwind };

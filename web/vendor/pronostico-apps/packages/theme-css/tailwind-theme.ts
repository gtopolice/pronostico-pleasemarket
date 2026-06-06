/**
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
    primary: "var(--primary)",
    "surface-tint": "var(--surface-tint)",
    "on-primary": "var(--on-primary)",
    "primary-container": "var(--primary-container)",
    "on-primary-container": "var(--on-primary-container)",
    secondary: "var(--secondary)",
    "on-secondary": "var(--on-secondary)",
    "secondary-container": "var(--secondary-container)",
    "on-secondary-container": "var(--on-secondary-container)",
    tertiary: "var(--tertiary)",
    "on-tertiary": "var(--on-tertiary)",
    "tertiary-container": "var(--tertiary-container)",
    "on-tertiary-container": "var(--on-tertiary-container)",
    error: "var(--error)",
    "on-error": "var(--on-error)",
    "error-container": "var(--error-container)",
    "on-error-container": "var(--on-error-container)",
    background: "var(--background)",
    "on-background": "var(--on-background)",
    surface: "var(--surface)",
    "on-surface": "var(--on-surface)",
    "surface-variant": "var(--surface-variant)",
    "on-surface-variant": "var(--on-surface-variant)",
    outline: "var(--outline)",
    "outline-variant": "var(--outline-variant)",
    shadow: "var(--shadow)",
    scrim: "var(--scrim)",
    "inverse-surface": "var(--inverse-surface)",
    "inverse-on-surface": "var(--inverse-on-surface)",
    "inverse-primary": "var(--inverse-primary)",
    "primary-fixed": "var(--primary-fixed)",
    "on-primary-fixed": "var(--on-primary-fixed)",
    "primary-fixed-dim": "var(--primary-fixed-dim)",
    "on-primary-fixed-variant": "var(--on-primary-fixed-variant)",
    "secondary-fixed": "var(--secondary-fixed)",
    "on-secondary-fixed": "var(--on-secondary-fixed)",
    "secondary-fixed-dim": "var(--secondary-fixed-dim)",
    "on-secondary-fixed-variant": "var(--on-secondary-fixed-variant)",
    "tertiary-fixed": "var(--tertiary-fixed)",
    "on-tertiary-fixed": "var(--on-tertiary-fixed)",
    "tertiary-fixed-dim": "var(--tertiary-fixed-dim)",
    "on-tertiary-fixed-variant": "var(--on-tertiary-fixed-variant)",
    "surface-dim": "var(--surface-dim)",
    "surface-bright": "var(--surface-bright)",
    "surface-container-lowest": "var(--surface-container-lowest)",
    "surface-container-low": "var(--surface-container-low)",
    "surface-container": "var(--surface-container)",
    "surface-container-high": "var(--surface-container-high)",
    "surface-container-highest": "var(--surface-container-highest)",
  },
} as const;

export type TailwindThemeColors = typeof tailwindTheme.colors;

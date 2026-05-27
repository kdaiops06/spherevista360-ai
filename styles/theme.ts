type TypographyToken = {
  fontSize: string;
  lineHeight: string;
  fontWeight: 400 | 500;
  letterSpacing?: string;
  textTransform?: "uppercase";
};

export const colors = {
  background: "#0A0B0F",
  surface: "#111318",
  surfaceElevated: "#1A1D26",
  surfaceGlass: "rgba(255,255,255,0.03)",
  borderSubtle: "rgba(255,255,255,0.06)",
  borderDefault: "rgba(255,255,255,0.10)",
  blue: "#3B82F6",
  green: "#10B981",
  red: "#EF4444",
  amber: "#F59E0B",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#475569",
} as const;

export const statusColors = {
  liveGreen: colors.green,
  warningAmber: colors.amber,
  dangerRed: colors.red,
  neutralSlate: colors.textSecondary,
} as const;

export const typography: Record<
  "display" | "h1" | "h2" | "h3" | "body" | "small" | "micro",
  TypographyToken
> = {
  display: { fontSize: "48px", lineHeight: "56px", fontWeight: 500 },
  h1: { fontSize: "32px", lineHeight: "40px", fontWeight: 500 },
  h2: { fontSize: "24px", lineHeight: "32px", fontWeight: 500 },
  h3: { fontSize: "18px", lineHeight: "28px", fontWeight: 500 },
  body: { fontSize: "16px", lineHeight: "24px", fontWeight: 400 },
  small: { fontSize: "13px", lineHeight: "20px", fontWeight: 400 },
  micro: {
    fontSize: "11px",
    lineHeight: "16px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
} as const;

export const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

export const shadows = {
  shadowSm: "0 1px 2px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.03)",
  shadowMd: "0 8px 20px rgba(0, 0, 0, 0.34), 0 0 0 1px rgba(255, 255, 255, 0.04)",
  shadowGlowBlue: "0 0 0 1px rgba(59, 130, 246, 0.35), 0 10px 28px rgba(59, 130, 246, 0.12)",
  shadowGlowGreen: "0 0 0 1px rgba(16, 185, 129, 0.35), 0 10px 28px rgba(16, 185, 129, 0.12)",
} as const;

export const motion = {
  transitionFast: "140ms cubic-bezier(0.4, 0, 0.2, 1)",
  transitionBase: "220ms cubic-bezier(0.4, 0, 0.2, 1)",
  transitionSlow: "360ms cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

export const chartPalette = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#64748B",
] as const;

export const semantic = {
  positive: colors.green,
  negative: colors.red,
  caution: colors.amber,
  neutral: colors.textSecondary,
} as const;

export const zIndex = {
  base: 0,
  dropdown: 20,
  sticky: 30,
  overlay: 40,
  modal: 50,
  toast: 60,
  tooltip: 70,
} as const;

export const radius = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  full: "9999px",
} as const;

export const containerWidths = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1200px",
  "2xl": "1280px",
} as const;

export const cssCustomProperties = {
  "--color-bg": colors.background,
  "--color-surface": colors.surface,
  "--color-surface-elevated": colors.surfaceElevated,
  "--color-surface-glass": colors.surfaceGlass,
  "--border-subtle": colors.borderSubtle,
  "--border-default": colors.borderDefault,
  "--accent-blue": colors.blue,
  "--accent-green": colors.green,
  "--accent-red": colors.red,
  "--accent-amber": colors.amber,
  "--text-primary": colors.textPrimary,
  "--text-secondary": colors.textSecondary,
  "--text-muted": colors.textMuted,
  "--status-live": statusColors.liveGreen,
  "--status-warning": statusColors.warningAmber,
  "--status-danger": statusColors.dangerRed,
  "--status-neutral": statusColors.neutralSlate,
  "--font-sans": "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  "--type-display-size": typography.display.fontSize,
  "--type-display-line": typography.display.lineHeight,
  "--type-h1-size": typography.h1.fontSize,
  "--type-h1-line": typography.h1.lineHeight,
  "--type-h2-size": typography.h2.fontSize,
  "--type-h2-line": typography.h2.lineHeight,
  "--type-h3-size": typography.h3.fontSize,
  "--type-h3-line": typography.h3.lineHeight,
  "--type-body-size": typography.body.fontSize,
  "--type-body-line": typography.body.lineHeight,
  "--type-small-size": typography.small.fontSize,
  "--type-small-line": typography.small.lineHeight,
  "--type-micro-size": typography.micro.fontSize,
  "--type-micro-line": typography.micro.lineHeight,
  "--type-micro-track": typography.micro.letterSpacing ?? "0.08em",
  "--space-1": spacing[1],
  "--space-2": spacing[2],
  "--space-3": spacing[3],
  "--space-4": spacing[4],
  "--space-5": spacing[5],
  "--space-6": spacing[6],
  "--space-8": spacing[8],
  "--space-10": spacing[10],
  "--space-12": spacing[12],
  "--space-16": spacing[16],
  "--space-20": spacing[20],
  "--space-24": spacing[24],
  "--shadow-sm": shadows.shadowSm,
  "--shadow-md": shadows.shadowMd,
  "--shadow-glow-blue": shadows.shadowGlowBlue,
  "--shadow-glow-green": shadows.shadowGlowGreen,
  "--transition-fast": motion.transitionFast,
  "--transition-base": motion.transitionBase,
  "--transition-slow": motion.transitionSlow,
  "--radius-xs": radius.xs,
  "--radius-sm": radius.sm,
  "--radius-md": radius.md,
  "--radius-lg": radius.lg,
  "--radius-xl": radius.xl,
  "--z-base": String(zIndex.base),
  "--z-dropdown": String(zIndex.dropdown),
  "--z-sticky": String(zIndex.sticky),
  "--z-overlay": String(zIndex.overlay),
  "--z-modal": String(zIndex.modal),
  "--z-toast": String(zIndex.toast),
  "--z-tooltip": String(zIndex.tooltip),
  "--container-sm": containerWidths.sm,
  "--container-md": containerWidths.md,
  "--container-lg": containerWidths.lg,
  "--container-xl": containerWidths.xl,
  "--container-2xl": containerWidths["2xl"],
  "--chart-1": chartPalette[0],
  "--chart-2": chartPalette[1],
  "--chart-3": chartPalette[2],
  "--chart-4": chartPalette[3],
  "--chart-5": chartPalette[4],
  "--chart-6": chartPalette[5],
  "--chart-7": chartPalette[6],
} as const;

export const rootCssVariables = `:root {
${Object.entries(cssCustomProperties)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join("\n")}
}`;

export type ThemeTokens = {
  colors: typeof colors;
  statusColors: typeof statusColors;
  typography: typeof typography;
  spacing: typeof spacing;
  shadows: typeof shadows;
  motion: typeof motion;
  chartPalette: typeof chartPalette;
  semantic: typeof semantic;
  zIndex: typeof zIndex;
  radius: typeof radius;
  containerWidths: typeof containerWidths;
  cssCustomProperties: typeof cssCustomProperties;
};

export const theme: ThemeTokens = {
  colors,
  statusColors,
  typography,
  spacing,
  shadows,
  motion,
  chartPalette,
  semantic,
  zIndex,
  radius,
  containerWidths,
  cssCustomProperties,
};
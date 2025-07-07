// Color Palette Constants
// Based on the provided palette: #205781, #4F959D, #98D2C0, #F6F8D5

export const ColorPalette = {
  // Primary colors from the palette
  navy: {
    hex: '#205781',
    rgb: 'rgb(32, 87, 129)',
    hsl: 'hsl(203 60% 32%)', // Converted from rgb(32, 87, 129)
    description: 'Deep navy blue - primary brand color',
  },
  teal: {
    hex: '#4F959D',
    rgb: 'rgb(79, 149, 157)',
    hsl: 'hsl(186 33% 46%)', // Converted from rgb(79, 149, 157)
    description: 'Medium teal - secondary brand color',
  },
  mint: {
    hex: '#98D2C0',
    rgb: 'rgb(152, 210, 192)',
    hsl: 'hsl(161 40% 71%)', // Converted from rgb(152, 210, 192)
    description: 'Light mint green - accent color',
  },
  cream: {
    hex: '#F6F8D5',
    rgb: 'rgb(246, 248, 213)',
    hsl: 'hsl(63 60% 90%)', // Converted from rgb(246, 248, 213)
    description: 'Light cream - background accent',
  },
} as const;

// Semantic color mappings for theming
export const SemanticColors = {
  light: {
    // Core colors
    primary: ColorPalette.navy.hsl,
    primaryForeground: ColorPalette.cream.hsl,
    secondary: ColorPalette.teal.hsl,
    secondaryForeground: ColorPalette.cream.hsl,
    accent: ColorPalette.mint.hsl,
    accentForeground: ColorPalette.navy.hsl,

    // Background colors
    background: ColorPalette.cream.hsl,
    foreground: ColorPalette.navy.hsl,
    card: 'hsl(0 0% 100%)', // Pure white for cards
    cardForeground: ColorPalette.navy.hsl,

    // UI element colors
    muted: 'hsl(161 40% 95%)', // Very light mint
    mutedForeground: 'hsl(203 30% 45%)', // Lighter navy
    border: ColorPalette.mint.hsl,
    input: 'hsl(161 40% 92%)', // Light mint for inputs
    ring: ColorPalette.teal.hsl, // Focus ring

    // Status colors
    destructive: 'hsl(0 84% 60%)', // Red for errors
    destructiveForeground: 'hsl(0 0% 98%)',

    // Popover colors
    popover: 'hsl(0 0% 100%)',
    popoverForeground: ColorPalette.navy.hsl,

    // Sidebar colors
    sidebarBackground: ColorPalette.cream.hsl,
    sidebarForeground: ColorPalette.navy.hsl,
    sidebarPrimary: ColorPalette.navy.hsl,
    sidebarPrimaryForeground: ColorPalette.cream.hsl,
    sidebarAccent: ColorPalette.mint.hsl,
    sidebarAccentForeground: ColorPalette.navy.hsl,
    sidebarBorder: ColorPalette.mint.hsl,
    sidebarRing: ColorPalette.teal.hsl,
  },
  dark: {
    // Core colors - adjusted for dark theme
    primary: ColorPalette.teal.hsl,
    primaryForeground: ColorPalette.navy.hsl,
    secondary: 'hsl(203 40% 25%)', // Darker navy
    secondaryForeground: ColorPalette.mint.hsl,
    accent: 'hsl(203 50% 20%)', // Dark navy accent
    accentForeground: ColorPalette.mint.hsl,

    // Background colors
    background: 'hsl(203 50% 8%)', // Very dark navy
    foreground: ColorPalette.mint.hsl,
    card: 'hsl(203 45% 12%)', // Dark navy for cards
    cardForeground: ColorPalette.mint.hsl,

    // UI element colors
    muted: 'hsl(203 40% 15%)', // Dark muted
    mutedForeground: 'hsl(186 20% 65%)', // Light teal
    border: 'hsl(203 40% 22%)', // Dark border
    input: 'hsl(203 40% 18%)', // Dark input
    ring: ColorPalette.mint.hsl, // Focus ring

    // Status colors
    destructive: 'hsl(0 62% 55%)', // Red for errors
    destructiveForeground: 'hsl(0 0% 98%)',

    // Popover colors
    popover: 'hsl(203 45% 12%)',
    popoverForeground: ColorPalette.mint.hsl,

    // Sidebar colors
    sidebarBackground: 'hsl(203 50% 8%)', // Very dark navy
    sidebarForeground: ColorPalette.mint.hsl,
    sidebarPrimary: ColorPalette.teal.hsl,
    sidebarPrimaryForeground: ColorPalette.navy.hsl,
    sidebarAccent: 'hsl(203 50% 20%)', // Dark navy accent
    sidebarAccentForeground: ColorPalette.mint.hsl,
    sidebarBorder: 'hsl(203 40% 22%)', // Dark border
    sidebarRing: ColorPalette.mint.hsl,
  },
} as const;

// Chart colors using the palette
export const ChartColors = {
  light: [
    ColorPalette.navy.hsl,
    ColorPalette.teal.hsl,
    ColorPalette.mint.hsl,
    'hsl(203 40% 60%)', // Light navy variant
    'hsl(186 50% 65%)', // Light teal variant
  ],
  dark: [
    ColorPalette.teal.hsl,
    ColorPalette.mint.hsl,
    'hsl(186 40% 70%)', // Lighter teal
    'hsl(161 50% 75%)', // Lighter mint
    'hsl(203 60% 65%)', // Lighter navy
  ],
} as const;

// Utility functions
export const colorUtils = {
  /**
   * Get a specific color from the palette
   */
  getColor: (
    colorName: keyof typeof ColorPalette,
    format: 'hex' | 'rgb' | 'hsl' = 'hsl'
  ) => {
    return ColorPalette[colorName][format];
  },

  /**
   * Get semantic colors for a specific theme
   */
  getSemanticColors: (theme: 'light' | 'dark') => {
    return SemanticColors[theme];
  },

  /**
   * Get chart colors for a specific theme
   */
  getChartColors: (theme: 'light' | 'dark') => {
    return ChartColors[theme];
  },

  /**
   * Generate CSS custom properties for a theme
   */
  generateCSSProperties: (theme: 'light' | 'dark') => {
    const colors = SemanticColors[theme];
    const charts = ChartColors[theme];

    return {
      '--background': colors.background,
      '--foreground': colors.foreground,
      '--card': colors.card,
      '--card-foreground': colors.cardForeground,
      '--popover': colors.popover,
      '--popover-foreground': colors.popoverForeground,
      '--primary': colors.primary,
      '--primary-foreground': colors.primaryForeground,
      '--secondary': colors.secondary,
      '--secondary-foreground': colors.secondaryForeground,
      '--muted': colors.muted,
      '--muted-foreground': colors.mutedForeground,
      '--accent': colors.accent,
      '--accent-foreground': colors.accentForeground,
      '--destructive': colors.destructive,
      '--destructive-foreground': colors.destructiveForeground,
      '--border': colors.border,
      '--input': colors.input,
      '--ring': colors.ring,
      '--chart-1': charts[0],
      '--chart-2': charts[1],
      '--chart-3': charts[2],
      '--chart-4': charts[3],
      '--chart-5': charts[4],
      '--sidebar-background': colors.sidebarBackground,
      '--sidebar-foreground': colors.sidebarForeground,
      '--sidebar-primary': colors.sidebarPrimary,
      '--sidebar-primary-foreground': colors.sidebarPrimaryForeground,
      '--sidebar-accent': colors.sidebarAccent,
      '--sidebar-accent-foreground': colors.sidebarAccentForeground,
      '--sidebar-border': colors.sidebarBorder,
      '--sidebar-ring': colors.sidebarRing,
      '--radius': '0.6rem',
    };
  },
};

// Type exports for better TypeScript support
export type ColorName = keyof typeof ColorPalette;
export type ColorFormat = 'hex' | 'rgb' | 'hsl';
export type ThemeMode = 'light' | 'dark';
export type SemanticColorKey = keyof typeof SemanticColors.light;

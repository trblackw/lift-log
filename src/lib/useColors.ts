import { useTheme } from './theme';
import { ColorPalette, type ColorName, type ColorFormat } from './colors';

/**
 * Custom hook that provides easy access to the color palette system
 * Returns color utilities that are theme-aware and provide consistent access
 */
export function useColors() {
  const { resolvedTheme, getColor, getSemanticColors, getChartColors } =
    useTheme();

  return {
    // Raw palette access
    palette: ColorPalette,

    // Theme-aware color access
    theme: resolvedTheme,
    semantic: getSemanticColors(resolvedTheme),
    charts: getChartColors(resolvedTheme),

    // Utility functions
    getRawColor: (colorName: ColorName, format: ColorFormat = 'hsl') =>
      getColor(colorName, format),

    // CSS variable access for dynamic styling
    cssVar: (variableName: string) => `var(--${variableName})`,

    // Helper to get a CSS color value
    css: {
      primary: 'hsl(var(--primary))',
      secondary: 'hsl(var(--secondary))',
      accent: 'hsl(var(--accent))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      muted: 'hsl(var(--muted))',
      border: 'hsl(var(--border))',
      destructive: 'hsl(var(--destructive))',
      destructiveForeground: 'hsl(var(--destructive-foreground))',
      // Add more as needed
    },

    // Convenience functions for common use cases
    getNavyColor: (format: ColorFormat = 'hsl') => ColorPalette.navy[format],
    getTealColor: (format: ColorFormat = 'hsl') => ColorPalette.teal[format],
    getMintColor: (format: ColorFormat = 'hsl') => ColorPalette.mint[format],
    getCreamColor: (format: ColorFormat = 'hsl') => ColorPalette.cream[format],
    getRedColor: (format: ColorFormat = 'hsl') => ColorPalette.red[format],
  };
}

/**
 * Helper function to create style objects with theme-aware colors
 * Usage: const style = createThemeStyle((colors) => ({ backgroundColor: colors.primary }))
 */
export function createThemeStyle(
  styleFunction: (colors: ReturnType<typeof useColors>) => React.CSSProperties
) {
  return (colors: ReturnType<typeof useColors>) => styleFunction(colors);
}

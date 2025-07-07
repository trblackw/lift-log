import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useColors } from '@/lib/useColors';
import { useTheme } from '@/lib/theme';

interface ColorSwatchProps {
  name: string;
  color: string;
  description?: string;
}

function ColorSwatch({ name, color, description }: ColorSwatchProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border">
      <div
        className="w-12 h-12 rounded-md border-2 border-border/20 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1">
        <div className="font-medium text-sm">{name}</div>
        <div className="text-xs text-muted-foreground font-mono">{color}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

export function ColorPaletteDemo() {
  const colors = useColors();
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Lift Log Color Palette</h1>
        <p className="text-muted-foreground">
          Current theme: <span className="font-medium">{theme}</span>
          {theme === 'system' && ` (resolved: ${resolvedTheme})`}
        </p>
        <Button onClick={toggleTheme} variant="outline">
          Toggle Theme
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Raw Palette Colors */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Raw Palette</h2>
            <div className="space-y-3">
              <ColorSwatch
                name="Navy"
                color={colors.getNavyColor('hex')}
                description={colors.palette.navy.description}
              />
              <ColorSwatch
                name="Teal"
                color={colors.getTealColor('hex')}
                description={colors.palette.teal.description}
              />
              <ColorSwatch
                name="Mint"
                color={colors.getMintColor('hex')}
                description={colors.palette.mint.description}
              />
              <ColorSwatch
                name="Cream"
                color={colors.getCreamColor('hex')}
                description={colors.palette.cream.description}
              />
            </div>
          </CardContent>
        </Card>

        {/* Semantic Colors */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Semantic Colors</h2>
            <div className="space-y-3">
              <ColorSwatch
                name="Primary"
                color={colors.css.primary}
                description="Main brand color"
              />
              <ColorSwatch
                name="Secondary"
                color={colors.css.secondary}
                description="Secondary brand color"
              />
              <ColorSwatch
                name="Accent"
                color={colors.css.accent}
                description="Accent and highlight color"
              />
              <ColorSwatch
                name="Background"
                color={colors.css.background}
                description="Main background color"
              />
            </div>
          </CardContent>
        </Card>

        {/* Component Examples */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Component Examples</h2>
            <div className="space-y-3">
              <Button variant="default" className="w-full">
                Primary Button
              </Button>
              <Button variant="secondary" className="w-full">
                Secondary Button
              </Button>
              <Button variant="outline" className="w-full">
                Outline Button
              </Button>
              <div className="p-3 bg-muted rounded-md text-center">
                Muted Background
              </div>
              <div className="p-3 bg-accent rounded-md text-center">
                Accent Background
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Colors */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Chart Colors</h2>
            <div className="space-y-3">
              {colors.charts.map((chartColor, index) => (
                <ColorSwatch
                  key={index}
                  name={`Chart ${index + 1}`}
                  color={`hsl(${chartColor})`}
                  description={`Chart color ${index + 1}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Examples */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-semibold">Usage Examples</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">Raw Colors</h3>
              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                {`const colors = useColors();
colors.getNavyColor('hex') // ${colors.getNavyColor('hex')}
colors.getTealColor('hsl') // ${colors.getTealColor('hsl')}`}
              </pre>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">CSS Variables</h3>
              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                {`style={{ 
  backgroundColor: colors.css.primary,
  color: colors.css.foreground 
}}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

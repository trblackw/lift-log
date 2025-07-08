import { SecondaryButton } from '@/components/ui/standardButtons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/lib/theme';
import { MoonIcon, SunIcon } from 'lucide-react';

export function Settings() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Theme</div>
              <div className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </div>
            </div>
            <SecondaryButton
              onClick={toggleTheme}
              variant="outline"
              className="min-w-20"
            >
              {theme === 'dark' ? (
                <MoonIcon className="size-6 text-primary" />
              ) : (
                <SunIcon className="size-6 text-yellow-400" />
              )}
            </SecondaryButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

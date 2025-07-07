import { useState } from 'react';
import { GhostButton } from '@/components/ui/standardButtons';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/lib/theme';
import IconGear from './icons/icon-gear';

export function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <GhostButton
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="size-5 cursor-pointer hover:bg-transparent hover:text-primary"
      >
        <IconGear className="h-4 w-4" />
      </GhostButton>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Popup */}
          <Card className="absolute right-0 top-10 z-50 w-32">
            <CardContent className="p-2">
              <GhostButton
                size="sm"
                onClick={toggleTheme}
                className="w-full justify-start gap-2 h-8"
              >
                {theme === 'dark' ? (
                  <span className="text-xs">Light</span>
                ) : (
                  <span className="text-xs">Dark</span>
                )}
              </GhostButton>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

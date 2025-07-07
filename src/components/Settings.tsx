import { useState } from 'react';
import { GhostButton } from '@/components/ui/standardButtons';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/lib/theme';

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
        className="h-8 w-8 p-0 rounded-full"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
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
            <CardContent className="p-3">
              <GhostButton
                size="sm"
                onClick={toggleTheme}
                className="w-full justify-start gap-2 h-8"
              >
                {theme === 'dark' ? (
                  <>
                    <span>☀️</span>
                    <span className="text-xs">Light</span>
                  </>
                ) : (
                  <>
                    <span>🌙</span>
                    <span className="text-xs">Dark</span>
                  </>
                )}
              </GhostButton>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

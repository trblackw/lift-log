import { useTheme } from '@/lib/theme';
import { Toaster as Sonner } from 'sonner';
import type { ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps['theme']}
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'hsl(var(--toast-bg))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--toast-border))',
          borderRadius: '8px',
          backdropFilter: 'blur(8px)',
        },
      }}
      style={
        {
          '--normal-bg': 'hsl(var(--toast-bg))',
          '--normal-text': 'hsl(var(--foreground))',
          '--normal-border': 'hsl(var(--toast-border))',
          '--success-bg': 'hsl(210 100% 95%)',
          '--success-text': 'hsl(210 100% 20%)',
          '--success-border': 'hsl(210 100% 80%)',
          '--error-bg': 'hsl(0 85% 95%)',
          '--error-text': 'hsl(0 85% 20%)',
          '--error-border': 'hsl(0 85% 80%)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

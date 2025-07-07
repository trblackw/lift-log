import { Button } from '@/components/ui/button';
import type { ViewMode } from '@/lib/types';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'list' as ViewMode, label: 'Workouts', icon: '📝' },
    { id: 'create' as ViewMode, label: 'Create', icon: '➕' },
    { id: 'active' as ViewMode, label: 'Active', icon: '🏃‍♂️' },
  ];

  return (
    <nav className="grid grid-cols-3 gap-2 lg:gap-4">
      {navItems.map(item => (
        <Button
          key={item.id}
          variant={currentView === item.id ? 'default' : 'outline'}
          onClick={() => onViewChange(item.id)}
          className="flex flex-col items-center gap-1 h-16 lg:h-20 text-xs lg:text-sm font-medium cursor-pointer"
          size="sm"
        >
          <span className="text-lg lg:text-xl">{item.icon}</span>
          <span>{item.label}</span>
        </Button>
      ))}
    </nav>
  );
}

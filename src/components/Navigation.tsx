import { Button } from "@/components/ui/button";
import type { ViewMode } from "@/lib/types";

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
    <nav className="flex gap-2 justify-center mb-6">
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant={currentView === item.id ? "default" : "outline"}
          onClick={() => onViewChange(item.id)}
          className="flex items-center gap-2"
        >
          <span>{item.icon}</span>
          {item.label}
        </Button>
      ))}
    </nav>
  );
} 
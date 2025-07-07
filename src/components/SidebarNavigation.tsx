import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Settings } from './Settings';
import type { ViewMode } from '@/lib/types';

interface SidebarNavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function SidebarNavigation({
  currentView,
  onViewChange,
}: SidebarNavigationProps) {
  const navItems = [
    {
      id: 'list' as ViewMode,
      label: 'Workouts',
      icon: '📝',
      description: 'View and manage your workouts',
    },
    {
      id: 'create' as ViewMode,
      label: 'Create',
      icon: '➕',
      description: 'Create a new workout',
    },
    {
      id: 'active' as ViewMode,
      label: 'Active',
      icon: '🏃‍♂️',
      description: 'Start or continue an active workout',
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-2 py-4">
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              Lift Log
            </h2>
            <p className="text-xs text-sidebar-foreground/70">
              Track your progress
            </p>
          </div>
          <Settings />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map(item => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => onViewChange(item.id)}
                isActive={currentView === item.id}
                tooltip={item.description}
                className="flex items-center gap-3 py-3"
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                    {item.description}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

interface AppSidebarLayoutProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  children: React.ReactNode;
}

export function AppSidebarLayout({
  currentView,
  onViewChange,
  children,
}: AppSidebarLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full" style={{ width: '100vw' }}>
        <SidebarNavigation
          currentView={currentView}
          onViewChange={onViewChange}
        />
        <main className="flex-1 overflow-auto">
          <div className="flex items-center gap-2 p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <div className="flex-1" />
          </div>
          <div className="p-4">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

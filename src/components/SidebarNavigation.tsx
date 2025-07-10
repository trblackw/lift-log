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
import { ActiveWorkoutBanner } from './ActiveWorkoutBanner';
import type { ViewMode, Workout, ActiveWorkoutSession } from '@/lib/types';
import IconList from './icons/icon-list';
import IconPlusBordered from './icons/icon-plus-bordered';
import IconBench from './icons/icon-bench';
import IconActiveRun from './icons/icon-active-run';
import IconCalendar from './icons/icon-calendar';
import IconHistory from './icons/icon-history';
import IconGear from './icons/icon-gear';
import { format } from 'date-fns';
import IconPuzzlePiece from './icons/icon-puzzle-piece';

interface SidebarNavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

interface NavItem {
  id: ViewMode;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'create',
    label: 'Create',
    icon: <IconPlusBordered />,
    description: 'Create a new workout',
  },
  {
    id: 'list',
    label: 'Workouts',
    icon: <IconList />,
    description: 'View & manage your workouts',
  },
  {
    id: 'composer',
    label: 'Composer',
    icon: <IconPuzzlePiece className="size-5" />,
    description: 'Build workouts from exercise library',
  },
  {
    id: 'active',
    label: 'Active',
    icon: <IconActiveRun className="size-5" />,
    description: 'Start or continue a workout',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: <IconCalendar />,
    description: 'View workout schedule',
  },
  {
    id: 'history',
    label: 'History',
    icon: <IconHistory />,
    description: 'View workout trends & analytics',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <IconGear className="size-5" />,
    description: 'App preferences',
  },
];

export function SidebarNavigation({
  currentView,
  onViewChange,
}: SidebarNavigationProps) {
  const { setOpenMobile, isMobile } = useSidebar();

  const handleNavigation = (view: ViewMode) => {
    onViewChange(view);
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-center px-2 py-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2">
              <IconBench className="size-5" />
              <h2 className="text-lg font-semibold text-sidebar-foreground">
                Lift Log
              </h2>
            </div>
            <p className="text-xs text-sidebar-foreground/70">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map(item => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => handleNavigation(item.id)}
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
  activeWorkoutSession?: ActiveWorkoutSession | null;
  activeWorkout?: Workout | null;
  onResumeWorkout?: () => void;
  onEndWorkout?: () => void;
}

export function AppSidebarLayout({
  currentView,
  onViewChange,
  children,
  activeWorkoutSession,
  activeWorkout,
  onResumeWorkout,
  onEndWorkout,
}: AppSidebarLayoutProps) {
  const displayActiveWorkoutBanner =
    activeWorkoutSession &&
    activeWorkout &&
    onResumeWorkout &&
    onEndWorkout &&
    currentView !== 'active';

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full" style={{ width: '100vw' }}>
        <SidebarNavigation
          currentView={currentView}
          onViewChange={onViewChange}
        />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-20 flex items-center gap-4 p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <div className="flex-1 flex flex-col items-center justify-center gap-1 lg:hidden">
              <div className="flex items-center gap-2">
                <IconBench className="size-8" />
                <h1 className="text-2xl font-bold text-foreground">Lift Log</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div className="w-8" />
          </div>

          <div className="p-4 space-y-4">
            {/* Active Workout Banner */}
            {displayActiveWorkoutBanner && (
              <ActiveWorkoutBanner
                activeSession={activeWorkoutSession}
                workout={activeWorkout}
                onResume={onResumeWorkout}
                onEnd={onEndWorkout}
                currentView={currentView}
              />
            )}

            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

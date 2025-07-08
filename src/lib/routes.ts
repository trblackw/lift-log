/**
 * Strongly typed route definitions and utilities
 * Centralizes all route paths and provides type-safe route construction
 */

// Route parameter types
export interface WorkoutRouteParams {
  workoutId: string;
}

export interface CalendarRouteParams {
  date: string; // YYYY-MM-DD format
}

// Path segment constants - building blocks for routes
export const PATHS = {
  // Root segments
  ROOT: '/',

  // Main path segments
  WORKOUTS: 'workouts',
  ACTIVE: 'active',
  CALENDAR: 'calendar',
  HISTORY: 'history',
  SETTINGS: 'settings',

  // Action segments
  CREATE: 'create',
  EDIT: 'edit',

  // Parameter segments
  WORKOUT_ID: ':workoutId',
  DATE: ':date',

  // Catch-all
  WILDCARD: '*',
} as const;

// Complete route constants composed from path segments
export const ROUTES = {
  // Root
  ROOT: PATHS.ROOT,

  // Workouts
  WORKOUTS: `/${PATHS.WORKOUTS}`,
  WORKOUTS_CREATE: `/${PATHS.WORKOUTS}/${PATHS.CREATE}`,
  WORKOUTS_DETAIL: `/${PATHS.WORKOUTS}/${PATHS.WORKOUT_ID}`,
  WORKOUTS_EDIT: `/${PATHS.WORKOUTS}/${PATHS.WORKOUT_ID}/${PATHS.EDIT}`,

  // Active workout
  ACTIVE: `/${PATHS.ACTIVE}`,

  // Calendar
  CALENDAR: `/${PATHS.CALENDAR}`,
  CALENDAR_DAY: `/${PATHS.CALENDAR}/${PATHS.DATE}`,

  // History
  HISTORY: `/${PATHS.HISTORY}`,

  // Settings
  SETTINGS: `/${PATHS.SETTINGS}`,

  // 404 catch-all
  NOT_FOUND: PATHS.WILDCARD,
} as const;

// Route builder functions for parameterized routes
export const buildRoute = {
  /**
   * Build workout detail route
   * @param workoutId - The workout ID
   * @returns /workouts/{workoutId}
   */
  workoutDetail: (workoutId: string): string => {
    return `/workouts/${workoutId}`;
  },

  /**
   * Build workout edit route
   * @param workoutId - The workout ID
   * @returns /workouts/{workoutId}/edit
   */
  workoutEdit: (workoutId: string): string => {
    return `/workouts/${workoutId}/edit`;
  },

  /**
   * Build calendar day route
   * @param date - Date in YYYY-MM-DD format or Date object
   * @returns /calendar/{YYYY-MM-DD}
   */
  calendarDay: (date: string | Date): string => {
    const dateString =
      typeof date === 'string' ? date : date.toISOString().split('T')[0];
    return `/calendar/${dateString}`;
  },
} as const;

// Route parsing utilities
export const parseRoute = {
  /**
   * Extract workout ID from workout detail/edit routes
   * @param pathname - Current pathname
   * @returns workout ID or null if not found
   */
  getWorkoutId: (pathname: string): string | null => {
    const workoutDetailMatch = pathname.match(
      /^\/workouts\/([^\/]+)(?:\/edit)?$/
    );
    return workoutDetailMatch ? workoutDetailMatch[1] : null;
  },

  /**
   * Extract date from calendar day route
   * @param pathname - Current pathname
   * @returns date string (YYYY-MM-DD) or null if not found
   */
  getCalendarDate: (pathname: string): string | null => {
    const calendarMatch = pathname.match(/^\/calendar\/(.+)$/);
    return calendarMatch ? calendarMatch[1] : null;
  },

  /**
   * Check if current path is a specific route
   * @param pathname - Current pathname
   * @param route - Route to check against
   * @returns true if pathname matches the route pattern
   */
  isRoute: (pathname: string, route: string): boolean => {
    if (route.includes(':')) {
      // Convert route pattern to regex
      const pattern = route.replace(/:[^\/]+/g, '[^\/]+').replace(/\//g, '\\/');
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname === route;
  },
} as const;

// Navigation utilities
export const navigation = {
  /**
   * Get the view mode based on current pathname
   * @param pathname - Current pathname
   * @returns ViewMode for sidebar navigation
   */
  getViewModeFromPath: (
    pathname: string
  ):
    | 'list'
    | 'create'
    | 'details'
    | 'active'
    | 'calendar'
    | 'day'
    | 'history'
    | 'settings' => {
    if (pathname === ROUTES.WORKOUTS) return 'list';
    if (pathname === ROUTES.WORKOUTS_CREATE) return 'create';
    if (parseRoute.isRoute(pathname, ROUTES.WORKOUTS_EDIT)) return 'create';
    if (parseRoute.isRoute(pathname, ROUTES.WORKOUTS_DETAIL)) return 'details';
    if (pathname === ROUTES.ACTIVE) return 'active';
    if (pathname === ROUTES.CALENDAR) return 'calendar';
    if (parseRoute.isRoute(pathname, ROUTES.CALENDAR_DAY)) return 'day';
    if (pathname === ROUTES.HISTORY) return 'history';
    if (pathname === ROUTES.SETTINGS) return 'settings';
    return 'list';
  },

  /**
   * Get route for a specific view mode
   * @param viewMode - The view mode to navigate to
   * @returns Route path
   */
  getRouteForViewMode: (viewMode: string): string => {
    switch (viewMode) {
      case 'list':
        return ROUTES.WORKOUTS;
      case 'create':
        return ROUTES.WORKOUTS_CREATE;
      case 'active':
        return ROUTES.ACTIVE;
      case 'calendar':
        return ROUTES.CALENDAR;
      case 'history':
        return ROUTES.HISTORY;
      case 'settings':
        return ROUTES.SETTINGS;
      default:
        return ROUTES.WORKOUTS;
    }
  },
} as const;

// Type exports for external use
export type PathKey = keyof typeof PATHS;
export type PathSegment = (typeof PATHS)[PathKey];
export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

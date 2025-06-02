// Custom route types for the application
export type AuthRoute = 
  | '/(auth)/login'
  | '/(auth)/register'
  | '/(auth)/role-select';

export type StringerRoute =
  | '/(stringer)'
  | '/(stringer)/clients'
  | '/(stringer)/inventory'
  | '/(stringer)/settings'
  | '/(stringer)/jobs'
  | '/(stringer)/jobs/new';

export type CustomerRoute =
  | '/(customer)'
  | '/(customer)/find-stringer'
  | '/(customer)/my-racquets'
  | '/(customer)/orders'
  | '/(customer)/settings';

export type PublicRoute =
  | '/'
  | '/stringer/[id]'
  | '/stringer/[id]/services'
  | '/stringer/[id]/gallery'
  | '/stringer/[id]/reviews';

export type AppRoute = AuthRoute | StringerRoute | CustomerRoute | PublicRoute;

export interface AppRouteParams {
  // Auth routes
  '/(auth)/login': Record<string, never>;
  '/(auth)/register': { role?: 'stringer' | 'customer'; stringerId?: string };
  '/(auth)/role-select': Record<string, never>;

  // Stringer routes
  '/(stringer)': Record<string, never>;
  '/(stringer)/clients': Record<string, never>;
  '/(stringer)/inventory': Record<string, never>;
  '/(stringer)/settings': Record<string, never>;
  '/(stringer)/jobs': Record<string, never>;
  '/(stringer)/jobs/new': Record<string, never>;
  '/(stringer)/jobs/[id]': { id: string };
  '/(stringer)/jobs/[id]/edit': { id: string };

  // Customer routes
  '/(customer)': Record<string, never>;
  '/(customer)/find-stringer': Record<string, never>;
  '/(customer)/my-racquets': Record<string, never>;
  '/(customer)/orders': Record<string, never>;
  '/(customer)/settings': Record<string, never>;
  '/(customer)/orders/[id]': { id: string };

  // Public routes
  '/': Record<string, never>;
  '/stringer/[id]': { id: string };
  '/stringer/[id]/services': { id: string };
  '/stringer/[id]/gallery': { id: string };
  '/stringer/[id]/reviews': { id: string };
} 
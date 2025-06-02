export const ROUTES = {
  AUTH: {
    LOGIN: '/(auth)/login',
    REGISTER: '/(auth)/register',
    ROLE_SELECT: '/(auth)/role-select',
    FORGOT: '/(auth)/forgot',
  },
  STRINGER: {
    DASHBOARD: '/(stringer)',
    CLIENTS: '/(stringer)/clients',
    INVENTORY: '/(stringer)/inventory',
    SETTINGS: '/(stringer)/settings',
    JOBS: '/(stringer)/jobs',
    NEW_JOB: '/(stringer)/jobs/new',
  },
  CUSTOMER: {
    DASHBOARD: '/(customer)',
    FIND_STRINGER: '/(customer)/find-stringer',
    MY_RACQUETS: '/(customer)/my-racquets',
    ORDERS: '/(customer)/orders',
    SETTINGS: '/(customer)/settings',
  },
} as const; 
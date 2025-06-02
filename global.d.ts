import { NavigatorScreenParams } from '@react-navigation/native';

// Define the root stack param list
declare global {
  type RootStackParamList = {
    // Auth Stack
    '(auth)/login': undefined;
    '(auth)/register': undefined;
    '(auth)/forgot-password': undefined;
    
    // Customer Stack
    '(customer)': undefined;
    '(customer)/find-stringer': undefined;
    '(customer)/my-racquets': undefined;
    '(customer)/orders': undefined;
    '(customer)/product/[id]': { id: string };
    '(customer)/services/book': { serviceId: string };
    '(customer)/orders/[id]': { id: string };
    '(customer)/racquet/[id]': { id: string };
    
    // Stringer Stack
    '(stringer)': undefined;
    
    // Common
    '/(tabs)': NavigatorScreenParams<TabParamList>;
    '/(auth)': NavigatorScreenParams<AuthParamList>;
  };

  // Tab Navigator params
  type TabParamList = {
    home: undefined;
    explore: undefined;
    cart: undefined;
    profile: undefined;
  };

  // Auth Navigator params
  type AuthParamList = {
    login: undefined;
    register: undefined;
    'forgot-password': undefined;
  };

  // Extend React Navigation types
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// This tells TypeScript about the global path types
type RelativePathString = `./${string}` | `../${string}` | '..';
type ExternalPathString = `http${string}`;
type InternalPathString = `/${string}`;

type PathString = RelativePathString | ExternalPathString | InternalPathString;

declare module 'expo-router' {
  export interface LinkProps {
    href: PathString | { pathname: string; params?: any };
    // Add other Link props as needed
  }
  
  export function useRouter(): {
    push: (path: PathString | { pathname: string; params?: any }) => void;
    replace: (path: PathString | { pathname: string; params?: any }) => void;
    back: () => void;
    // Add other router methods as needed
  };
}

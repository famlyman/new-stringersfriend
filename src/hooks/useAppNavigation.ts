import { useRouter } from 'expo-router';
import { AppRoute, AppRouteParams } from '../types/routes';

export function useAppNavigation() {
  const router = useRouter();

  const navigate = (route: AppRoute, params?: Partial<AppRouteParams[AppRoute]>) => {
    if (params && Object.keys(params).length > 0) {
      router.push({
        pathname: route,
        params,
      } as any);
    } else {
      router.push(route as any);
    }
  };

  const replace = (route: AppRoute, params?: Partial<AppRouteParams[AppRoute]>) => {
    if (params && Object.keys(params).length > 0) {
      router.replace({
        pathname: route,
        params,
      } as any);
    } else {
      router.replace(route as any);
    }
  };

  return {
    navigate,
    replace,
  };
} 
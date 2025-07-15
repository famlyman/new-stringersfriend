// Expo app config converted from app.json to app.config.ts
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'StringersFriend',
  slug: 'stringers-friend',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'stringersfriend',
  newArchEnabled: true,
  icon: require('./assets/images/icon.png'),
  userInterfaceStyle: 'light',
  splash: {
    image: require('./assets/images/splash-icon.png'),
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: require('./assets/images/adaptive-icon.png'),
      backgroundColor: '#ffffff',
    },
    softwareKeyboardLayoutMode: 'pan',
  },
  web: {
    favicon: require('./assets/images/favicon.png'),
  },
  jsEngine: 'jsc',
  extra: {
    eas: {
      projectId: '377f52d9-10f0-40c8-aecb-608cd50bd5b5',
    }
  },
  owner: 'famlyman',
});
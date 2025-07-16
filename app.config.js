const variant = process.env.APP_VARIANT;

module.exports = ({ config }) => {
  let name = 'StringersFriend';
  let slug = 'stringers-friend';
  let bundleIdentifier = 'com.famlyman.stringersfriend';
  let androidPackage = 'com.famlyman.stringersfriend';

  if (variant === 'development') {
    name = 'StringersFriend (Dev)';
    // Keep the original slug for EAS project consistency
    // slug = 'stringers-friend-dev';
    bundleIdentifier = 'com.famlyman.stringersfriend.dev';
    androidPackage = 'com.famlyman.stringersfriend.dev';
  } else if (variant === 'internal') {
    name = 'StringersFriend (Internal)';
    // Keep the original slug for EAS project consistency
    // slug = 'stringers-friend-internal';
    bundleIdentifier = 'com.famlyman.stringersfriend.internal';
    androidPackage = 'com.famlyman.stringersfriend.internal';
  }

  return {
    ...config,
    name,
    slug,
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'stringersfriend',
    newArchEnabled: true,
    userInterfaceStyle: 'light',
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier,
    },
    android: {
      softwareKeyboardLayoutMode: 'pan',
      package: androidPackage,
    },
    jsEngine: 'jsc',
    extra: {
      eas: {
        projectId: '377f52d9-10f0-40c8-aecb-608cd50bd5b5',
      }
    },
  };
};
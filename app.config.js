const IS_DEV = process.env.EXPO_PUBLIC_DEV_MODE === 'true';

module.exports = ({ config }) => ({
  ...config,
  name: 'GeoQuest',
  slug: 'GeoQuest',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'geoquest',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0B1F3A',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.geoquest.app',
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_IOS || undefined,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'GeoQuest uses your location to show nearby caches on the map and to check whether you are close enough to unlock one.',
      NSCameraUsageDescription:
        'GeoQuest uses the camera so you can capture photo evidence when you discover a cache.',
    },
  },
  android: {
    package: 'com.geoquest.app',
    adaptiveIcon: {
      backgroundColor: '#0B1F3A',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID || undefined,
      },
    },
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'CAMERA'],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Allow GeoQuest to use your location to find nearby caches and unlock them when you are close enough.',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          'Allow GeoQuest to use the camera to capture photo evidence for cache discoveries.',
      },
    ],
  ],
  extra: {
    devMode: IS_DEV,
  },
});

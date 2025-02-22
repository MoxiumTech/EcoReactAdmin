import { ExpoConfig, ConfigContext } from 'expo/config';

const getConfig = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Store App",
  slug: "store-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.store.app"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.store.app"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    // Development configuration
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api/storefront',
    androidApiBaseUrl: process.env.ANDROID_API_BASE_URL || 'http://10.0.2.2:3000/api/storefront',
    storeId: process.env.STORE_ID || '80f318db-677f-45f6-8522-a2e8c6fdabe8',
    developmentMode: process.env.NODE_ENV !== 'production',
    apiTimeout: 30000,
  }
});

export default getConfig;
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface Store {
  id: string;
  name: string;
  domain?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
}

export async function generateMobileApp(store: Store) {
  const appsDir = path.join(process.cwd(), 'generated-apps');
  const storeAppDir = path.join(appsDir, `${store.id}-mobile`);
  const templateDir = path.join(process.cwd(), 'mobile');

  try {
    // Create apps directory if it doesn't exist
    await fs.mkdir(appsDir, { recursive: true });

    // Create new directory for the store's app
    await fs.mkdir(storeAppDir, { recursive: true });

    // Copy mobile template
    await execAsync(`cp -R ${templateDir}/* ${storeAppDir}/`);

    // Update app configuration
    const appConfig = {
      name: `${store.name} Store`,
      slug: `${store.id}-store`,
      version: "1.0.0",
      orientation: "portrait",
      icon: store.logoUrl || "./assets/icon.png",
      userInterfaceStyle: "light",
      splash: {
        image: store.logoUrl || "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      assetBundlePatterns: [
        "**/*"
      ],
      ios: {
        supportsTablet: true,
        bundleIdentifier: `com.${store.domain || store.id}.mobile`
      },
      android: {
        adaptiveIcon: {
          foregroundImage: store.logoUrl || "./assets/adaptive-icon.png",
          backgroundColor: "#ffffff"
        },
        package: `com.${store.domain || store.id}.mobile`
      },
      web: {
        favicon: store.faviconUrl || "./assets/favicon.png"
      },
      extra: {
        apiBaseUrl: process.env.NODE_ENV === 'development'
          ? `http://${store.domain}.lvh.me:3000/api/storefront`
          : `https://${store.domain}/api/storefront`,
        storeId: store.id
      }
    };

    await fs.writeFile(
      path.join(storeAppDir, 'app.config.ts'),
      `import { ExpoConfig } from 'expo/config';\n\nexport default (): ExpoConfig => (${JSON.stringify(appConfig, null, 2)});`
    );

    // Install dependencies
    await execAsync('npm install', { cwd: storeAppDir });

    return {
      success: true,
      appDir: storeAppDir,
    };
  } catch (error) {
    console.error('Error generating mobile app:', error);
    throw error;
  }
}
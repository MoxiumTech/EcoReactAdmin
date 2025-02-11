import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { isDev } from './is-dev';
import { setupAuthHandlers } from './auth-handler';
import { loadEnvConfig } from './env-config';

// Load environment configuration
const envConfig = loadEnvConfig();

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      sandbox: true
    }
  });

  // Load the app
  const startUrl = isDev() 
    ? `http://${envConfig.ADMIN_DOMAIN}` // Development server URL (using configured domain)
    : `file://${path.join(__dirname, '../.next/server/app/index.html')}`; // Production build path

  // Set CSP and other security headers
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' " + envConfig.ADMIN_DOMAIN + " " + envConfig.MAIN_DOMAIN + "; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' " + envConfig.ADMIN_DOMAIN + "; " +
          "style-src 'self' 'unsafe-inline' " + envConfig.ADMIN_DOMAIN + "; " +
          "img-src 'self' data: https: " + envConfig.ADMIN_DOMAIN + "; " +
          "connect-src 'self' " + envConfig.ADMIN_DOMAIN + " " + envConfig.MAIN_DOMAIN + " https://*.supabase.co https://cloud.appwrite.io"
        ],
        'X-Frame-Options': ['DENY'],
        'X-Content-Type-Options': ['nosniff']
      }
    });
  });

  // Handle new window creation
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Allow only specific domains
    if (url.startsWith(`http://${envConfig.ADMIN_DOMAIN}`) || 
        url.startsWith(`http://${envConfig.MAIN_DOMAIN}`)) {
      return { action: 'allow' };
    }
    return { action: 'deny' };
  });

  mainWindow.loadURL(startUrl);

  // Open the DevTools in development mode.
  if (isDev()) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Set up IPC handlers
setupAuthHandlers();

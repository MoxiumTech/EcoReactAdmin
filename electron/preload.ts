import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    auth: {
      login: (credentials: { email: string; password: string }) => 
        ipcRenderer.invoke('auth:login', credentials),
      logout: () => ipcRenderer.invoke('auth:logout'),
      checkStatus: () => ipcRenderer.invoke('auth:check')
    },
    // Add any other methods you need to expose here
    getEnv: () => {
      return {
        MAIN_DOMAIN: process.env.MAIN_DOMAIN,
        ADMIN_DOMAIN: process.env.ADMIN_DOMAIN,
        NODE_ENV: process.env.NODE_ENV
      };
    }
  }
);

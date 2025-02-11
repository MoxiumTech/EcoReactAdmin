import { ipcMain } from 'electron';
import axios from 'axios';
import { loadEnvConfig } from './env-config';

const envConfig = loadEnvConfig();

interface AuthResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export function setupAuthHandlers() {
  // Handle login
  ipcMain.handle('auth:login', async (event, credentials: { email: string; password: string }) => {
    try {
      const response = await axios.post<AuthResponse>(
        `http://${envConfig.ADMIN_DOMAIN}/api/auth/signin`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success && response.data.token) {
        // Store the token securely in electron session
        event.sender.session.cookies.set({
          url: `http://${envConfig.ADMIN_DOMAIN}`,
          name: 'admin_token',
          value: response.data.token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production'
        });

        return {
          success: true,
          token: response.data.token
        };
      }

      return {
        success: false,
        error: 'Invalid credentials'
      };
    } catch (error) {
      console.error('Auth error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  });

  // Handle logout
  ipcMain.handle('auth:logout', async (event) => {
    try {
      // Clear the auth token
      await event.sender.session.cookies.remove(`http://${envConfig.ADMIN_DOMAIN}`, 'admin_token');
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: 'Logout failed'
      };
    }
  });

  // Check auth status
  ipcMain.handle('auth:check', async (event) => {
    try {
      const cookie = await event.sender.session.cookies.get({
        name: 'admin_token',
        url: `http://${envConfig.ADMIN_DOMAIN}`
      });

      return {
        isAuthenticated: cookie.length > 0,
        token: cookie[0]?.value
      };
    } catch (error) {
      console.error('Auth check error:', error);
      return {
        isAuthenticated: false
      };
    }
  });
}

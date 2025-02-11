interface Window {
  electron: {
    auth: {
      login: (credentials: { email: string; password: string }) => Promise<{
        success: boolean;
        token?: string;
        error?: string;
      }>;
      logout: () => Promise<{
        success: boolean;
        error?: string;
      }>;
      checkStatus: () => Promise<{
        isAuthenticated: boolean;
        token?: string;
      }>;
    };
    getEnv: () => {
      MAIN_DOMAIN: string;
      ADMIN_DOMAIN: string;
      NODE_ENV: string;
    };
  };
}

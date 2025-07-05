export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'WorkFlow Management System',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    debug: import.meta.env.VITE_DEBUG === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
    demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  },
  auth: {
    jwtSecret: import.meta.env.VITE_JWT_SECRET,
    jwtExpiresIn: import.meta.env.VITE_JWT_EXPIRES_IN || '24h',
    refreshTokenExpiresIn: import.meta.env.VITE_REFRESH_TOKEN_EXPIRES_IN || '7d',
    sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '1800000'),
    enable2FA: import.meta.env.VITE_ENABLE_2FA === 'true',
  },
  upload: {
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'), // 10MB
    allowedFileTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf,doc,docx,txt').split(','),
  },
  storage: {
    userKey: 'workflow-user',
    tokenKey: 'workflow-token',
    refreshTokenKey: 'workflow-refresh-token',
    themeKey: 'workflow-theme',
    settingsKey: 'workflow-settings',
  },
} as const;

export type Config = typeof config;

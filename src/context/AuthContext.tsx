import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AuthState, User, UserRole, RolePermissions } from '../types';
import { authService, LoginCredentials } from '../services/auth';
import { showToast } from '../components/common/Toast';
import { config } from '../config';

interface AuthAction {
  type: 'LOGIN_START' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'UPDATE_USER' | 'REFRESH_TOKEN';
  payload?: any;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  permissions: {
    create: [],
    read: [],
    update: [],
    delete: [],
    manage: []
  }
};

const rolePermissions: Record<UserRole, RolePermissions> = {
  [UserRole.DEPARTMENT_HEAD]: {
    create: ['tasks', 'projects', 'users'],
    read: ['all'],
    update: ['all'],
    delete: ['all'],
    manage: ['all']
  },
  [UserRole.MANAGER]: {
    create: ['tasks', 'projects'],
    read: ['department'],
    update: ['department'],
    delete: ['tasks'],
    manage: ['team']
  },
  [UserRole.ASSISTANT_MANAGER]: {
    create: ['tasks'],
    read: ['team'],
    update: ['team'],
    delete: ['own_tasks'],
    manage: ['tasks']
  },
  [UserRole.TEAM_LEAD]: {
    create: ['tasks'],
    read: ['team'],
    update: ['team_tasks'],
    delete: ['own_tasks'],
    manage: ['team_tasks']
  },
  [UserRole.EMPLOYEE]: {
    create: ['tasks'],
    read: ['own'],
    update: ['own'],
    delete: ['own_tasks'],
    manage: []
  }
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'LOGIN_SUCCESS':
      const user = action.payload as User;
      return {
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions: rolePermissions[user.role]
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        permissions: initialState.permissions
      };

    case 'LOGOUT':
      return {
        ...initialState
      };

    case 'UPDATE_USER':
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...action.payload } as User;
      return {
        ...state,
        user: updatedUser,
        permissions: rolePermissions[updatedUser.role]
      };

    case 'REFRESH_TOKEN':
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

interface AuthContextValue {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (action: string, resource: string) => boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Session timeout handler
let sessionTimeoutId: NodeJS.Timeout | null = null;
let warningTimeoutId: NodeJS.Timeout | null = null;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Clear session timeouts
  const clearSessionTimeouts = useCallback(() => {
    if (sessionTimeoutId) clearTimeout(sessionTimeoutId);
    if (warningTimeoutId) clearTimeout(warningTimeoutId);
    sessionTimeoutId = null;
    warningTimeoutId = null;
  }, []);

  // Setup session timeout
  const setupSessionTimeout = useCallback(() => {
    clearSessionTimeouts();

    if (config.auth.sessionTimeout) {
      // Show warning 5 minutes before timeout
      const warningTime = config.auth.sessionTimeout - 5 * 60 * 1000; // 5 minutes before
      
      if (warningTime > 0) {
        warningTimeoutId = setTimeout(() => {
          showToast.warning('Your session will expire in 5 minutes. Please save your work.');
        }, warningTime);
      }

      // Auto logout after timeout
      sessionTimeoutId = setTimeout(async () => {
        showToast.error('Session expired. Please log in again.');
        await logout();
      }, config.auth.sessionTimeout);
    }
  }, [clearSessionTimeouts]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = authService.getStoredUser();
      const token = authService.getStoredToken();

      if (storedUser && token) {
        try {
          // Verify token and get fresh user data
          const currentUser = await authService.getCurrentUser();
          dispatch({ type: 'LOGIN_SUCCESS', payload: currentUser });
          setupSessionTimeout();
        } catch (error) {
          // Token is invalid, clear stored data
          await authService.logout();
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    initializeAuth();
  }, [setupSessionTimeout]);

  // Reset session timeout on user activity
  useEffect(() => {
    if (state.isAuthenticated) {
      const resetTimeout = () => setupSessionTimeout();
      
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, resetTimeout, true);
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resetTimeout, true);
        });
      };
    }
  }, [state.isAuthenticated, setupSessionTimeout]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const { user } = await authService.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      setupSessionTimeout();
      showToast.success(`Welcome back, ${user.name}!`);
      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      showToast.error(errorMessage);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSessionTimeouts();
      dispatch({ type: 'LOGOUT' });
      showToast.info('You have been logged out successfully.');
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const refreshUserData = async (): Promise<void> => {
    try {
      const currentUser = await authService.getCurrentUser();
      dispatch({ type: 'UPDATE_USER', payload: currentUser });
    } catch (error: any) {
      showToast.error('Failed to refresh user data');
      console.error('Failed to refresh user data:', error);
    }
  };

  const hasPermission = (action: string, resource: string): boolean => {
    if (!state.isAuthenticated || !state.permissions) return false;
    
    const permissions = state.permissions;
    
    // Check if user has 'all' permissions
    if (permissions.read.includes('all') || permissions.manage.includes('all')) {
      return true;
    }
    
    // Check specific permission
    const permissionKey = action as keyof RolePermissions;
    return permissions[permissionKey]?.includes(resource) || false;
  };

  const value: AuthContextValue = {
    state,
    login,
    logout,
    updateUser,
    hasPermission,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
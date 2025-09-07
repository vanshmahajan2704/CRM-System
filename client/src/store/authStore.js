import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api';

// Token validation utility function
const isTokenValid = (token) => {
  // Check 1: Basic existence and type
  if (!token || typeof token !== 'string') return false;
  
  // Check 2: JWT structure (should have 3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Check 3: Try to decode and check expiration
  try {
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Date.now() / 1000;
    
    // If token has an expiration and it's in the past, it's invalid
    if (payload.exp && currentTime > payload.exp) {
      return false;
    }
    
    return true; // Token passed all checks
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Token cleanup utility function
const validateAndCleanToken = (tokenKey) => {
  const token = localStorage.getItem(tokenKey);
  
  // Check if it exists and is a string
  if (!token || typeof token !== 'string') {
    localStorage.removeItem(tokenKey);
    return null;
  }

  // Check if it's a properly formatted JWT
  const parts = token.split('.');
  if (parts.length !== 3) {
    localStorage.removeItem(tokenKey);
    return null;
  }

  // Try to decode and validate the token
  try {
    const payload = JSON.parse(atob(parts[1]));
    if (typeof payload !== 'object') {
      throw new Error('Invalid payload');
    }
    
    // Check expiration
    const currentTime = Date.now() / 1000;
    if (payload.exp && currentTime > payload.exp) {
      localStorage.removeItem(tokenKey);
      return null;
    }
    
    return token;
  } catch (error) {
    console.error(`Invalid token stored in ${tokenKey}:`, error);
    localStorage.removeItem(tokenKey);
    return null;
  }
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      
      initializeAuth: () => {
        try {
          // Use the validation function instead of directly accessing localStorage
          const token = validateAndCleanToken('token');
          const userData = localStorage.getItem('user');
          
          // Parse user data if it exists and is valid
          let user = null;
          if (userData && userData !== 'undefined' && userData !== 'null') {
            try {
              user = JSON.parse(userData);
            } catch (e) {
              console.error('Error parsing user data:', e);
              localStorage.removeItem('user');
            }
          }
          
          // Only set state if we have a valid token and user
          if (token && user) {
            set({ user, token, loading: false });
          } else {
            // Clean up any invalid data
            if (!token) localStorage.removeItem('token');
            if (!user) localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
            set({ user: null, token: null, loading: false });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          // Clear all storage data on error
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          set({ user: null, token: null, loading: false });
        }
      },
      
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.login({ email, password });
          const { user, token, refreshToken } = response.data;

          console.log('🔄 API Response - user:', user);
          console.log('🔄 API Response - token:', token);

          // Validate token before storing
          if (!isTokenValid(token)) {
            throw new Error('Invalid token received from server');
          }

          // DEBUG: Check what's actually being saved
          console.log('💾 Saving to localStorage - user:', JSON.stringify(user));

          set({ user, token, loading: false, error: null });
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));

          // Verify it was saved correctly
          console.log('✅ Saved to localStorage - user:', localStorage.getItem('user'));

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || error.message || 'Login failed';
          set({ loading: false, error: message });
          
          // Clean up on error
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          return { success: false, error: message };
        }
      },
      
      logout: async () => {
        try {
          // Only attempt server logout if we have a valid token
          const { token } = get();
          if (token && isTokenValid(token)) {
            await authAPI.logout();
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, token: null, loading: false });
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      },
      
      setLoading: (loading) => set({ loading }),
      
      // New method to validate token on demand
      validateToken: () => {
        const { token } = get();
        if (!token || !isTokenValid(token)) {
          get().logout();
          return false;
        }
        return true;
      },
    }),
    {
      name: 'auth-storage',
      // Custom storage to handle potential errors
      storage: {
        getItem: (name) => {
          try {
            return localStorage.getItem(name);
          } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, value);
          } catch (error) {
            console.error('Error writing to storage:', error);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error('Error removing from storage:', error);
          }
        },
      },
    }
  )
);
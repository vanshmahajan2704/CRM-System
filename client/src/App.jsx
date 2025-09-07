// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import LeadsPage from './pages/LeadsPage';
import CustomersPage from './pages/CustomersPage';
import TasksPage from './pages/TasksPage';
import { useAuthStore } from './store/authStore';
import { setupLogoutDispatcher } from './api';

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

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading, initializeAuth } = useAuthStore();
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
}

// Public Route Component (redirects to dashboard if already authenticated)
function PublicRoute({ children }) {
  const { user, loading, initializeAuth } = useAuthStore();
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/" />;
}

// Main App Component
function AppContent() {
  const { logout } = useAuthStore();
  
  // Setup logout dispatcher for API layer
  useEffect(() => {
    setupLogoutDispatcher(logout);
  }, [logout]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="tasks" element={<TasksPage />} />
          
          {/* Catch all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

// Main App Wrapper
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Export the validation functions for use in your authStore
export { isTokenValid, validateAndCleanToken };
export default App;
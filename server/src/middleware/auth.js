import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        message: 'Not authorized, no token provided' 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Not authorized, user not found' 
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({ 
          message: 'Not authorized, account is deactivated' 
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ 
        message: 'Not authorized, token failed' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error in authentication' 
    });
  }
};

// Optional auth - doesn't fail if no token, but adds user if available
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = await User.findById(decoded.id).select('-password');
        
        if (req.user && !req.user.isActive) {
          req.user = null; // Don't allow deactivated users
        }
      } catch (error) {
        // Token is invalid, but we don't throw error for optional auth
        console.log('Optional auth token invalid:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue even if there's an error in optional auth
  }
};

// Verify refresh token middleware
export const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        message: 'Refresh token required' 
      });
    }

    try {
      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
      );
      
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ 
          message: 'User not found' 
        });
      }

      if (!user.isActive) {
        return res.status(401).json({ 
          message: 'Account is deactivated' 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Refresh token verification error:', error);
      return res.status(403).json({ 
        message: 'Invalid refresh token' 
      });
    }
  } catch (error) {
    console.error('Refresh token middleware error:', error);
    res.status(500).json({ 
      message: 'Server error in refresh token verification' 
    });
  }
};

// Check if user is authenticated (for frontend use)
export const isAuthenticated = async (req, res, next) => {
  try {
    await protect(req, res, next);
  } catch (error) {
    res.status(401).json({ 
      authenticated: false,
      message: 'Not authenticated' 
    });
  }
};
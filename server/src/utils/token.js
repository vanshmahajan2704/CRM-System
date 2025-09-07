// src/utils/token.js
import jwt from 'jsonwebtoken';

// Generate JWT access token
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'fallback_jwt_secret', 
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '1h' 
    }
  );
};

// Generate JWT refresh token
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(
      token, 
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
    );
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Decode token without verification (for getting payload)
const decodeToken = (token) => {
  return jwt.decode(token);
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Get token expiration time
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

// Generate tokens for user (both access and refresh)
const generateAuthTokens = (userId) => {
  const accessToken = generateToken(userId);
  const refreshToken = generateRefreshToken(userId);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  };
};

export {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  generateAuthTokens
};
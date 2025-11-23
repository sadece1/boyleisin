import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
  refreshAccessToken,
  logoutUser,
  changePassword,
} from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';
import {
  recordFailedAttempt,
  clearLoginAttempts,
  bruteForceProtection,
} from '../middleware/bruteForce';
import { blacklistToken } from '../utils/tokenManager';
import { getClientIp, getUserAgent } from '../utils/securityLogger';

/**
 * Register new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const result = await registerUser(name, email, password, req);

  // Set HttpOnly cookie for token (more secure than localStorage)
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', result.token, {
    httpOnly: true, // Prevents XSS attacks - JavaScript cannot access this cookie
    secure: isProduction, // Only send over HTTPS in production
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches JWT expiration)
    path: '/', // Available for all routes
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        ...result.user,
        created_at: parseDate(result.user.created_at),
        updated_at: parseDate(result.user.updated_at),
      },
      // Don't send token in response body for security (it's in HttpOnly cookie)
      // token: result.token, // Removed for security
    },
  });
});

/**
 * Login user with brute force protection
 */
export const login = [
  bruteForceProtection,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const result = await loginUser(email, password, req);
      
      // Clear failed attempts on successful login
      clearLoginAttempts(req);

      // Set HttpOnly cookie for token (more secure than localStorage)
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('token', result.token, {
        httpOnly: true, // Prevents XSS attacks - JavaScript cannot access this cookie
        secure: isProduction, // Only send over HTTPS in production
        sameSite: 'strict', // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches JWT expiration)
        path: '/', // Available for all routes
      });

      // Set refresh token in cookie as well (optional, can also be HttpOnly)
      if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          path: '/',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            ...result.user,
            created_at: parseDate(result.user.created_at),
            updated_at: parseDate(result.user.updated_at),
          },
          // Don't send tokens in response body for security (they're in HttpOnly cookies)
          // token: result.token, // Removed for security
          // refreshToken: result.refreshToken, // Removed for security
        },
      });
    } catch (error: any) {
      // Record failed attempt
      recordFailedAttempt(req);
      throw error; // Re-throw to be caught by error handler
    }
  }),
];

/**
 * Get user profile
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const user = await getUserById(req.user.id);

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      ...user,
      created_at: parseDate(user.created_at),
      updated_at: parseDate(user.updated_at),
    },
  });
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const { name, email, avatar } = req.body;

    const updatedUser = await updateUserProfile(req.user.id, {
      name,
      email,
      avatar,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...updatedUser,
        created_at: parseDate(updatedUser.created_at),
        updated_at: parseDate(updatedUser.updated_at),
      },
    });
  }
);

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  // Get refresh token from cookie or request body (backward compatibility)
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    res.status(400).json({
      success: false,
      message: 'Refresh token is required',
    });
    return;
  }

  const result = await refreshAccessToken(refreshToken);

  // Set new tokens in HttpOnly cookies
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', result.token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  if (result.refreshToken) {
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    // Don't send tokens in response body
    // data: {
    //   token: result.token,
    //   refreshToken: result.refreshToken,
    // },
  });
});

/**
 * Logout (revoke refresh tokens)
 */
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  // Get tokens from cookies or request body (backward compatibility)
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  const accessToken = req.cookies?.token || req.headers.authorization?.substring(7);

  // Revoke refresh token
  if (refreshToken) {
    await logoutUser(req.user.id, refreshToken);
  }

  // Blacklist access token if provided
  if (accessToken) {
    // Extract expiration from token (rough estimate: 7 days)
    const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
    blacklistToken(accessToken, expiresIn);
  }

  // Clear HttpOnly cookies
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * Change password
 */
export const changePasswordHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const { currentPassword, newPassword } = req.body;

  await changePassword(req.user.id, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});



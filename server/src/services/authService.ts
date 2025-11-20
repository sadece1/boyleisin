import bcrypt from 'bcrypt';
import pool from '../config/database';
import { User, UserPayload } from '../types';
import { generateId } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  rotateRefreshToken,
} from '../utils/tokenManager';
import {
  logSuccessfulLogin,
  logFailedLogin,
  getClientIp,
  getUserAgent,
} from '../utils/securityLogger';

const SALT_ROUNDS = 10;

/**
 * Hash password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Token functions moved to tokenManager.ts

/**
 * Register new user
 */
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  req?: any
): Promise<{ user: Omit<User, 'password_hash'>; token: string; refreshToken: string }> => {
  // Check if user exists
  const [existingUsers] = await pool.execute<Array<any>>(
    'SELECT id FROM users WHERE email = ?',
    [email.toLowerCase()]
  );

  if (existingUsers.length > 0) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const passwordHash = await hashPassword(password);
  const userId = generateId();

  // Insert user
  await pool.execute(
    `INSERT INTO users (id, email, name, password_hash, role, is_active)
     VALUES (?, ?, ?, ?, 'user', TRUE)`,
    [userId, email.toLowerCase(), name, passwordHash]
  );

  // Get created user
  const [users] = await pool.execute<Array<any>>(
    `SELECT id, email, name, avatar, role, is_active, created_at, updated_at
     FROM users WHERE id = ?`,
    [userId]
  );

  const user = users[0];
  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = generateRefreshToken(user.id);

  logger.info(`User registered: ${user.email}`);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
    token,
    refreshToken,
  };
};

/**
 * Login user
 */
export const loginUser = async (
  email: string,
  password: string,
  req?: any
): Promise<{ user: Omit<User, 'password_hash'>; token: string; refreshToken: string }> => {
  // Find user
  const [users] = await pool.execute<Array<any>>(
    `SELECT id, email, name, password_hash, avatar, role, is_active, created_at, updated_at
     FROM users WHERE email = ?`,
    [email.toLowerCase()]
  );

  if (users.length === 0) {
    throw new AppError('Invalid email or password', 401);
  }

  const user = users[0];

  // Check if user is active
  if (!user.is_active) {
    throw new AppError('Account is deactivated', 403);
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password_hash);

  if (!isValidPassword) {
    const ip = req ? getClientIp(req) : 'unknown';
    const userAgent = req ? getUserAgent(req) : undefined;
    logFailedLogin(email, ip, userAgent);
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = generateRefreshToken(user.id);

  const ip = req ? getClientIp(req) : 'unknown';
  const userAgent = req ? getUserAgent(req) : undefined;
  logSuccessfulLogin(user.id, user.email, ip, userAgent);
  logger.info(`User logged in: ${user.email}`);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
    token,
    refreshToken,
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (
  id: string
): Promise<Omit<User, 'password_hash'> | null> => {
  const [users] = await pool.execute<Array<any>>(
    `SELECT id, email, name, avatar, role, is_active, created_at, updated_at
     FROM users WHERE id = ?`,
    [id]
  );

  if (users.length === 0) {
    return null;
  }

  return users[0];
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: { name?: string; email?: string; avatar?: string }
): Promise<Omit<User, 'password_hash'>> => {
  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (updates.name) {
    updateFields.push('name = ?');
    updateValues.push(updates.name);
  }

  if (updates.email) {
    // Check if email is already taken
    const [existingUsers] = await pool.execute<Array<any>>(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [updates.email.toLowerCase(), userId]
    );

    if (existingUsers.length > 0) {
      throw new AppError('Email is already taken', 409);
    }

    updateFields.push('email = ?');
    updateValues.push(updates.email.toLowerCase());
  }

  if (updates.avatar !== undefined) {
    updateFields.push('avatar = ?');
    updateValues.push(updates.avatar);
  }

  if (updateFields.length === 0) {
    const user = await getUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(userId);

  await pool.execute(
    `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  const updatedUser = await getUserById(userId);
  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  logger.info(`User profile updated: ${userId}`);

  return updatedUser;
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ token: string; refreshToken: string }> => {
  const userId = verifyRefreshToken(refreshToken);

  if (!userId) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Get user to generate new tokens
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Rotate refresh token (security best practice)
  const newRefreshToken = rotateRefreshToken(refreshToken, userId);
  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { token, refreshToken: newRefreshToken };
};

/**
 * Logout user (revoke refresh tokens)
 */
export const logoutUser = async (userId: string, refreshToken?: string): Promise<void> => {
  if (refreshToken) {
    revokeRefreshToken(refreshToken);
  } else {
    // Revoke all tokens for user
    revokeAllUserTokens(userId);
  }
};

/**
 * Change user password
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  // Get user with password hash
  const [users] = await pool.execute<Array<any>>(
    `SELECT id, email, password_hash FROM users WHERE id = ?`,
    [userId]
  );

  if (users.length === 0) {
    throw new AppError('User not found', 404);
  }

  const user = users[0];

  // Verify current password
  const isValidPassword = await comparePassword(currentPassword, user.password_hash);

  if (!isValidPassword) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password
  await pool.execute(
    `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [newPasswordHash, userId]
  );

  logger.info(`Password changed for user: ${user.email}`);
};



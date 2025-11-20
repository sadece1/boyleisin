import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'CampscapeJWTSecret2025!',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  issuer: 'campscape-api',
  audience: 'campscape-client',
};














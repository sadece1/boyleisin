import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';

/**
 * Generate a UUID v4
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Parse MySQL date to ISO string
 */
export const parseDate = (date: Date | string | null): string | null => {
  if (!date) return null;
  return new Date(date).toISOString();
};

/**
 * Parse JSON fields from MySQL
 */
export const parseJson = <T>(json: string | T | null): T | null => {
  if (!json) return null;
  if (typeof json === 'string') {
    try {
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }
  return json as T;
};

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Check if row data packet is empty
 */
export const isEmpty = (result: RowDataPacket[]): boolean => {
  return !result || result.length === 0;
};

/**
 * Format pagination response
 */
export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export const formatPagination = ({ page, limit, total }: PaginationParams) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Extract pagination params from query
 */
export const getPaginationParams = (query: any) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Calculate total price for reservation
 */
export const calculateReservationPrice = (
  pricePerNight: number,
  startDate: Date,
  endDate: Date,
  gearPrices: number[] = []
): number => {
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const campsiteTotal = pricePerNight * nights;
  const gearTotal = gearPrices.reduce((sum, price) => sum + price * nights, 0);
  return campsiteTotal + gearTotal;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate slug from string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};














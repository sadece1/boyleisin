import pool from '../config/database';
import { User } from '../types';
import { getPaginationParams, formatPagination } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export const getDashboardStats = async () => {
  const [userCount] = await pool.execute<Array<any>>('SELECT COUNT(*) as count FROM users');
  const [campsiteCount] = await pool.execute<Array<any>>('SELECT COUNT(*) as count FROM campsites');
  const [gearCount] = await pool.execute<Array<any>>('SELECT COUNT(*) as count FROM gear');
  const [reservationCount] = await pool.execute<Array<any>>('SELECT COUNT(*) as count FROM reservations');
  const [blogCount] = await pool.execute<Array<any>>('SELECT COUNT(*) as count FROM blog_posts');
  const [reviewCount] = await pool.execute<Array<any>>('SELECT COUNT(*) as count FROM reviews');

  return {
    users: userCount[0].count,
    campsites: campsiteCount[0].count,
    gear: gearCount[0].count,
    reservations: reservationCount[0].count,
    blogPosts: blogCount[0].count,
    reviews: reviewCount[0].count,
  };
};

export const getAllUsers = async (query: any) => {
  const { page, limit, offset } = getPaginationParams(query);
  const [countResult] = await pool.execute<Array<any>>('SELECT COUNT(*) as total FROM users');
  const total = countResult[0].total;

  const [users] = await pool.execute<Array<any>>(
    'SELECT id, email, name, avatar, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );

  return {
    data: users,
    pagination: formatPagination({ page, limit, total }),
  };
};

export const updateUserRole = async (id: string, role: 'user' | 'admin'): Promise<void> => {
  await pool.execute('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [role, id]);
};

export const deleteUser = async (id: string): Promise<void> => {
  await pool.execute('DELETE FROM users WHERE id = ?', [id]);
};














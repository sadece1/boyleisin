import pool from '../config/database';
import { NewsletterSubscription } from '../types';
import { generateId, getPaginationParams, formatPagination, isEmpty } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export const subscribeNewsletter = async (email: string): Promise<NewsletterSubscription> => {
  // Check if already subscribed
  const [existing] = await pool.execute<Array<any>>(
    'SELECT * FROM newsletter_subscriptions WHERE email = ?',
    [email.toLowerCase()]
  );

  if (existing.length > 0) {
    const subscription = existing[0];
    if (subscription.subscribed) {
      throw new AppError('Email is already subscribed', 409);
    } else {
      // Resubscribe
      await pool.execute(
        'UPDATE newsletter_subscriptions SET subscribed = TRUE, subscribed_at = CURRENT_TIMESTAMP, unsubscribed_at = NULL WHERE email = ?',
        [email.toLowerCase()]
      );
      const [updated] = await pool.execute<Array<any>>(
        'SELECT * FROM newsletter_subscriptions WHERE email = ?',
        [email.toLowerCase()]
      );
      logger.info(`Newsletter resubscribed: ${email}`);
      return updated[0];
    }
  }

  const id = generateId();

  await pool.execute(
    `INSERT INTO newsletter_subscriptions (id, email, subscribed, subscribed_at)
     VALUES (?, ?, TRUE, CURRENT_TIMESTAMP)`,
    [id, email.toLowerCase()]
  );

  const [subscriptions] = await pool.execute<Array<any>>(
    'SELECT * FROM newsletter_subscriptions WHERE id = ?',
    [id]
  );

  logger.info(`Newsletter subscribed: ${email}`);
  return subscriptions[0];
};

export const unsubscribeNewsletter = async (email: string): Promise<void> => {
  const [subscriptions] = await pool.execute<Array<any>>(
    'SELECT * FROM newsletter_subscriptions WHERE email = ?',
    [email.toLowerCase()]
  );

  if (isEmpty(subscriptions)) {
    throw new AppError('Email not found in subscriptions', 404);
  }

  await pool.execute(
    'UPDATE newsletter_subscriptions SET subscribed = FALSE, unsubscribed_at = CURRENT_TIMESTAMP WHERE email = ?',
    [email.toLowerCase()]
  );

  logger.info(`Newsletter unsubscribed: ${email}`);
};

export const getSubscribers = async (query: any) => {
  const { page, limit, offset } = getPaginationParams(query);
  const conditions: string[] = [];
  const values: any[] = [];

  if (query.subscribed !== undefined) {
    conditions.push('subscribed = ?');
    values.push(query.subscribed);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countResult] = await pool.execute<Array<any>>(
    `SELECT COUNT(*) as total FROM newsletter_subscriptions ${whereClause}`,
    values
  );
  const total = countResult[0].total;

  const [subscribers] = await pool.execute<Array<any>>(
    `SELECT * FROM newsletter_subscriptions ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return {
    data: subscribers,
    pagination: formatPagination({ page, limit, total }),
  };
};

export const checkSubscription = async (email: string): Promise<boolean> => {
  const [subscriptions] = await pool.execute<Array<any>>(
    'SELECT subscribed FROM newsletter_subscriptions WHERE email = ?',
    [email.toLowerCase()]
  );

  if (isEmpty(subscriptions)) {
    return false;
  }

  return subscriptions[0].subscribed === 1 || subscriptions[0].subscribed === true;
};














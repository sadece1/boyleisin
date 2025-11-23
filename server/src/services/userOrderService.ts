import pool from '../config/database';
import { generateId } from '../utils/helpers';
import { RowDataPacket } from 'mysql2';

export interface UserOrder {
  id: string;
  user_id: string;
  gear_id: string;
  status: 'waiting' | 'arrived' | 'shipped';
  price: number;
  public_note?: string | null;
  private_note?: string | null;
  shipped_date?: string | null;
  shipped_time?: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get all user orders
 */
export const getUserOrders = async (userId?: string): Promise<UserOrder[]> => {
  let query = 'SELECT * FROM user_orders';
  const params: any[] = [];

  if (userId) {
    query += ' WHERE user_id = ?';
    params.push(userId);
  }

  query += ' ORDER BY created_at DESC';

  const [orders] = await pool.execute<RowDataPacket[]>(query, params);
  return orders as UserOrder[];
};

/**
 * Get single user order by ID
 */
export const getUserOrderById = async (id: string): Promise<UserOrder | null> => {
  const [orders] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM user_orders WHERE id = ?',
    [id]
  );

  if (orders.length === 0) {
    return null;
  }

  return orders[0] as UserOrder;
};

/**
 * Create new user order
 */
export const createUserOrder = async (data: {
  user_id: string;
  gear_id: string;
  status: 'waiting' | 'arrived' | 'shipped';
  price: number;
  public_note?: string | null;
  private_note?: string | null;
  shipped_date?: string | null;
  shipped_time?: string | null;
}): Promise<UserOrder> => {
  const id = generateId();

  await pool.execute(
    `INSERT INTO user_orders (id, user_id, gear_id, status, price, public_note, private_note, shipped_date, shipped_time)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.user_id,
      data.gear_id,
      data.status,
      data.price,
      data.public_note || null,
      data.private_note || null,
      data.shipped_date || null,
      data.shipped_time || null,
    ]
  );

  const order = await getUserOrderById(id);
  if (!order) {
    throw new Error('Failed to create user order');
  }

  return order;
};

/**
 * Update user order
 */
export const updateUserOrder = async (
  id: string,
  data: Partial<{
    status: 'waiting' | 'arrived' | 'shipped';
    price: number;
    public_note: string | null;
    private_note: string | null;
    shipped_date: string | null;
    shipped_time: string | null;
  }>
): Promise<UserOrder> => {
  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (data.status !== undefined) {
    updateFields.push('status = ?');
    updateValues.push(data.status);
  }
  if (data.price !== undefined) {
    updateFields.push('price = ?');
    // Ensure price is a number
    const priceValue = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
    updateValues.push(isNaN(priceValue) ? 0 : priceValue);
  }
  if (data.public_note !== undefined) {
    updateFields.push('public_note = ?');
    updateValues.push(data.public_note === '' ? null : data.public_note);
  }
  if (data.private_note !== undefined) {
    updateFields.push('private_note = ?');
    updateValues.push(data.private_note === '' ? null : data.private_note);
  }
  if (data.shipped_date !== undefined) {
    updateFields.push('shipped_date = ?');
    updateValues.push(data.shipped_date === '' ? null : data.shipped_date);
  }
  if (data.shipped_time !== undefined) {
    updateFields.push('shipped_time = ?');
    updateValues.push(data.shipped_time === '' ? null : data.shipped_time);
  }

  if (updateFields.length === 0) {
    const order = await getUserOrderById(id);
    if (!order) {
      throw new Error('User order not found');
    }
    return order;
  }

  // Add updated_at timestamp
  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  // Add id at the end for WHERE clause
  updateValues.push(id);

  const query = `UPDATE user_orders SET ${updateFields.join(', ')} WHERE id = ?`;
  
  try {
    await pool.execute(query, updateValues);
  } catch (error: any) {
    console.error('Error updating user order:', error);
    console.error('Query:', query);
    console.error('Values:', updateValues);
    throw new Error(`Failed to update user order: ${error.message || 'Unknown error'}`);
  }

  const order = await getUserOrderById(id);
  if (!order) {
    throw new Error('User order not found after update');
  }

  return order;
};

/**
 * Delete user order
 */
export const deleteUserOrder = async (id: string): Promise<void> => {
  await pool.execute('DELETE FROM user_orders WHERE id = ?', [id]);
};

